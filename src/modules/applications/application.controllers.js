import * as applicationService from './application.services.js';
import { successResponse } from '../../utils/response.js';

export const getApplications = async (req, res) => {

    const data = await applicationService.getAll();

    return res.status(200).json(
        successResponse({
            message: 'Applications retrieved successfully.',
            data,
            requestId: req.context.requestId
        })
    );
};

export const getApplication = async (req, res) => {

    const data = await applicationService.getById({
            id: req.params.id
        });

    return res.status(201).json(
        successResponse({
            message: 'Application retrieved successfully.',
            data,
            requestId: req.context.requestId
        })
    );
};

export const createApplication = async (req, res) => {

    const data = await applicationService.create({
            data: req.body,
            logo: req.file,
            context: req.context,
            authentication: req.authentication
        });

    return res.status(201).json(
        successResponse({
            message: 'Application created successfully.',
            data,
            requestId: req.context.requestId
        })
    );
};

export const updateApplication = async (req, res) => {

    const data = await applicationService.update({
        id: req.params.id,
        data: req.body,
        logo: req.file,
        context: req.context,
        authentication: req.authentication
    });

    return res.status(200).json(
        successResponse({
            message: 'Application updated successfully.',
            data,
            requestId: req.context.requestId
        })
    );
};

export const deleteApplication = async (req, res) => {

    await applicationService.remove({
        id: req.params.id,
        context: req.context,
        authentication: req.authentication
    });

    return res.status(200).json(
        successResponse({
            message: 'Application deleted successfully.',
            requestId: req.context.requestId
        })
    );
};