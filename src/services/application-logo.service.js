import fs from 'fs/promises';
import path from 'path';
import env from '../config/env.js';

const STORAGE_PATH = env.APPLICATION_LOGO_STORAGE;

const ensureDirectory = async () => {
    await fs.mkdir(STORAGE_PATH, {
        recursive: true
    });
};

const getExtension = filename =>
    path.extname(filename).toLowerCase();

const getFinalFilename = (code, extension) =>
    `${code}${extension}`;

const getTempFilename = (code, extension) =>
    `${code}.${Date.now()}.tmp${extension}`;

export const saveTemporary = async ({ code, logo }) => {

    if (!logo) {
        return null;
    }

    await ensureDirectory();

    const extension = getExtension(
        logo.originalname
    );

    const tempFilename = getTempFilename(
        code,
        extension
    );

    await fs.writeFile(
        path.join(STORAGE_PATH, tempFilename),
        logo.buffer
    );

    return {
        tempFilename,
        finalFilename: getFinalFilename(code, extension)
    };
};

export const promoteTemporary = async ({ tempFilename,finalFilename }) => {

    if (!tempFilename) {
        return;
    }

    const finalPath = path.join(STORAGE_PATH, finalFilename);

    try {
        await fs.unlink(finalPath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }

    await fs.rename(
        path.join(STORAGE_PATH, tempFilename),
        finalPath
    );
};

export const discardTemporary = async ({
    tempFilename
}) => {

    if (!tempFilename) {
        return;
    }

    try {

        await fs.unlink(
            path.join(STORAGE_PATH, tempFilename)
        );

    } catch (error) {

        if (error.code !== 'ENOENT') {
            throw error;
        }

    }

};

export const removeAll = async ({ code }) => {

    try {

        const files = await fs.readdir(STORAGE_PATH);

        await Promise.all(

            files
                .filter(file => {

                    if (!file.startsWith(`${code}.`)) {
                        return false;
                    }

                    if (file.includes('.tmp')) {
                        return false;
                    }

                    return true;

                })
                .map(file =>
                    fs.unlink(
                        path.join(STORAGE_PATH, file)
                    )
                )

        );

    } catch (error) {

        if (error.code !== 'ENOENT') {
            throw error;
        }

    }

};