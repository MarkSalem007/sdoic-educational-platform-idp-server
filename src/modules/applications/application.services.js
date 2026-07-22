import { applicationStatus, auditAction } from '@prisma/client';
import * as applicationRepository from './application.repository.js';
import * as auditService from '../../services/audit.service.js';
import { withTransaction } from '../../utils/index.js';
import { ConflictError, NotFoundError, ValidationError } from '../../errors/index.js';
import env  from '../../config/env.js';
import { validateApplicationUrls } from '../../utils/url.js';
import * as applicationLogoService from '../../services/application-logo.service.js';

const validateCallbackUrl = (callbackUrl) => {
    // Nothing to validate
    if (!callbackUrl) {
        return;
    }
    // Allow localhost and custom URLs during development
    if (env.NODE_ENV !== 'production') {
        return;
    }

    if (
        !isAllowedCallbackUrl(
            callbackUrl,
            env.ALLOWED_CALLBACK_DOMAINS
        )
    ) {
        throw new ValidationError(
            'INVALID_CALLBACK_DOMAIN',
            'Callback URL is not within an allowed domain.'
        );
    }
};

const saveApplicationLogo = async ({ code, logo }) => {

    if (!logo) {
        return null;
    }

    await fs.mkdir(
        env.APPLICATION_LOGO_STORAGE,
        { recursive: true }
    );

    const extension = path.extname(
        logo.originalname
    ).toLowerCase();

    const filename = `${code}${extension}`;

    const fullPath = path.join(
        env.APPLICATION_LOGO_STORAGE,
        filename
    );

    await fs.writeFile(
        fullPath,
        logo.buffer
    );

    return filename;

};

const removeApplicationLogos = async (code) => {

    try {

        await fs.mkdir(
            env.APPLICATION_LOGO_STORAGE,
            { recursive: true }
        );

        const files = await fs.readdir(
            env.APPLICATION_LOGO_STORAGE
        );

        const prefix = `${code}.`;

        await Promise.all(

            files
                .filter(file => file.startsWith(prefix))
                .map(file =>
                    fs.unlink(
                        path.join(
                            env.APPLICATION_LOGO_STORAGE,
                            file
                        )
                    )
                )

        );

    } catch {

        // Ignore missing files/directories

    }

};

export const getAll = async () => {

    return applicationRepository.findAll({
        where: {
            status: applicationStatus.ACTIVE
        },
        orderBy: {
            displayOrder: 'asc'
        }
    });
};

export const getById = async ({ id }) => {

    const application =
        await applicationRepository.findById({
            id
        });

    if (!application) {
        throw new NotFoundError(
            'APPLICATION_NOT_FOUND',
            'Application not found.'
        );
    }

    return application;
};

export const create = async ({ data, logo, authentication, context }) => {

    validateApplicationUrls({
        type: data.type,
        baseUrl: data.baseUrl,
        loginUrl: data.loginUrl,
        callbackUrl: data.callbackUrl,
        allowedDomains: env.ALLOWED_CALLBACK_DOMAINS,
        production: env.NODE_ENV === 'production'
    });

    const applicationData = {
        ...data,
        code: data.code.trim().toUpperCase(),
        type: data.type ?? 'INTERNAL'
    };

    console.log(data);
    console.log(applicationData);

    const existingCode =
        await applicationRepository.findByCode({
            code: applicationData.code
        });

    if (existingCode) {
        throw new ConflictError(
            'APPLICATION_CODE_EXISTS',
            'Application code already exists.'
        );
    }

    const existingUrl =
        await applicationRepository.findByBaseUrl({
            baseUrl: applicationData.baseUrl
        });

    if (existingUrl) {
        throw new ConflictError(
            'APPLICATION_URL_EXISTS',
            'Application URL already exists.'
        );
    }

    let upload = null;

    if (logo) {

        upload =
            await applicationLogoService.saveTemporary({
                code: applicationData.code,
                logo
            });

        applicationData.logo =
            upload.finalFilename;

    }

    try {

        const application =
            await withTransaction(async (tx) => {

                const created =
                    await applicationRepository.create({
                        tx,
                        data: applicationData
                    });

                await auditService.create({

                    tx,

                    context,

                    userId: authentication.user.id,

                    sessionId: authentication.session.id,

                    action: auditAction.CREATE_APPLICATION,

                    description:
                        `Created application '${created.name}'.`

                });

                return created;

            });

        if (upload) {

            await applicationLogoService.promoteTemporary({

                code: applicationData.code,

                tempFilename: upload.tempFilename,

                finalFilename: upload.finalFilename

            });

        }

        return application;

    } catch (error) {

        if (upload) {

            await applicationLogoService.discardTemporary({

                tempFilename: upload.tempFilename

            });

        }

        throw error;

    }

};

export const update = async ({ id, data, logo, authentication, context }) => {

    const application =
        await getById({ id });

    const updatedApplication = {
        ...application,
        ...data
    };

    validateApplicationUrls({
        type: updatedApplication.type,
        baseUrl: updatedApplication.baseUrl,
        loginUrl: updatedApplication.loginUrl,
        callbackUrl: updatedApplication.callbackUrl,
        allowedDomains: env.ALLOWED_CALLBACK_DOMAINS,
        production: env.NODE_ENV === 'production'
    });

    if (
        data.code &&
        data.code !== application.code
    ) {
        throw new ValidationError(
            'APPLICATION_CODE_IMMUTABLE',
            'Application code cannot be changed.'
        );
    }

    if (
        data.baseUrl &&
        data.baseUrl !== application.baseUrl
    ) {

        const existing =
            await applicationRepository.findByBaseUrl({

                baseUrl: data.baseUrl

            });

        if (
            existing &&
            existing.id !== id
        ) {

            throw new ConflictError(
                'APPLICATION_URL_EXISTS',
                'Application URL already exists.'
            );

        }

    }

    const updateData = {
        ...data
    };

    let upload = null;

    if (logo) {

        upload =
            await applicationLogoService.saveTemporary({

                code: application.code,

                logo

            });

        updateData.logo =
            upload.finalFilename;

    }

    try {

        const updated =
            await withTransaction(async (tx) => {

                const applicationUpdated =
                    await applicationRepository.update({

                        tx,

                        id,

                        data: updateData

                    });

                await auditService.create({

                    tx,

                    context,

                    userId: authentication.user.id,

                    sessionId: authentication.session.id,

                    action: auditAction.UPDATE_APPLICATION,

                    description:
                        `Updated application '${applicationUpdated.name}'.`

                });

                return applicationUpdated;

            });

        if (upload) {

            await applicationLogoService.promoteTemporary({

                code: application.code,

                tempFilename: upload.tempFilename,

                finalFilename: upload.finalFilename

            });

        }

        return updated;

    } catch (error) {

        if (upload) {

            await applicationLogoService.discardTemporary({

                tempFilename: upload.tempFilename

            });

        }

        throw error;

    }

};

export const remove = async ({
    id,
    authentication,
    context
}) => {

    const application =
        await applicationRepository.findById({

            id,

            include: {

                applicationModules: true,

                securityEvents: true,

                policies: true

            }

        });

    if (!application) {

        throw new NotFoundError(
            'APPLICATION_NOT_FOUND',
            'Application not found.'
        );

    }

    if (
        application.applicationModules?.length ||
        application.securityEvents?.length ||
        application.policies?.length
    ) {

        throw new ValidationError(
            'APPLICATION_IN_USE',
            'Application cannot be deleted because it is already in use.'
        );

    }

    await withTransaction(async (tx) => {

        await applicationRepository.remove({

            tx,

            id

        });

        await auditService.create({

            tx,

            context,

            userId: authentication.user.id,

            sessionId: authentication.session.id,

            action: auditAction.DELETE_APPLICATION,

            description:
                `Deleted application '${application.name}'.`

        });

    });

    await applicationLogoService.removeAll({
        code: application.code
    });

};

