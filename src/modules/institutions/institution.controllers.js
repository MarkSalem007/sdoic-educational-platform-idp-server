import * as institutionService from './institution.services.js';
import { validateCreateInstitution } from '../../dto/institutions/create-institution.dto.js';
import { validateUpdateInstitution } from '../../dto/institutions/update-institution.dto.js';
import { validateGetInstitutions } from '../../dto/institutions/get-institutions.dto.js';
import {
    asyncHandler,
    successResponse,
    toISOString
} from '../../utils/index.js';

export const createInstitution = asyncHandler(async (req, res) => {

    const data = validateCreateInstitution(req.body);
    const institution = await institutionService.createInstitution({ data });

    return res.status(201).json(
        successResponse({
            message: 'Institution created successfully.',
            data: institution,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const getInstitutions = asyncHandler(async (req, res) => {

    const { page, limit, search, isActive } = validateGetInstitutions(req.query);

    const result = await institutionService.getInstitutions({ page, limit, search, isActive });

    return res.status(200).json(
        successResponse({
            message: 'Institutions retrieved successfully.',
            data: result.institutions,
            meta: result.pagination,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const getInstitution = asyncHandler(async (req, res) => {

    const institution = await institutionService.getInstitution({
        institutionId: req.params.institutionId
    });

    return res.status(200).json(
        successResponse({
            message: 'Institution retrieved successfully.',
            data: institution,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const updateInstitution = asyncHandler(async (req, res) => {

    const data = validateUpdateInstitution(req.body);

    const institution = await institutionService.updateInstitution({
        institutionId: req.params.institutionId,
        data
    });

    return res.status(200).json(
        successResponse({
            message: 'Institution updated successfully.',
            data: institution,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const deleteInstitution = asyncHandler(async (req, res) => {

    await institutionService.deleteInstitution({
        institutionId: req.params.institutionId
    });

    return res.status(200).json(
        successResponse({
            message: 'Institution deleted successfully.',
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const uploadLogo = asyncHandler(async (req, res) => {

    const institution = await institutionService.uploadLogo({
        institutionId: req.params.institutionId,
        file: req.file
    });

    return res.status(200).json(
        successResponse({
            message: 'Institution logo uploaded successfully.',
            data: institution,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});
