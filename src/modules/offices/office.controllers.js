import * as officeService from './office.services.js';
import { validateCreateOffice } from '../../dto/offices/create-office.dto.js';
import { validateUpdateOffice } from '../../dto/offices/update-office.dto.js';
import { validateGetOffices} from '../../dto/offices/get-offices.dto.js';
import {
    asyncHandler,
    successResponse,
    toISOString
} from '../../utils/index.js';

export const createOffice = asyncHandler(async (req, res) => {

    const data = validateCreateOffice(req.body);
    const office = await officeService.createOffice({ data });

    return res.status(201).json(
        successResponse({
            message: 'Office created successfully.',
            data: office,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const getOffices = asyncHandler(async (req, res) => {

    const {
        page,
        limit,
        search,
        officeType
    } = validateGetOffices(req.query);

    const result = await officeService.getOffices({
        page,
        limit,
        search,
        officeType
    });

    return res.status(200).json(
        successResponse({
            message: 'Offices retrieved successfully.',
            data: result.offices,
            meta: result.pagination,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const getOffice = asyncHandler(async (req, res) => {

    const office = await officeService.getOffice({
        officeId: req.params.officeId
    });

    return res.status(200).json(
        successResponse({
            message: 'Office retrieved successfully.',
            data: office,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const updateOffice = asyncHandler(async (req, res) => {

    const data = validateUpdateOffice(req.body);

    const office = await officeService.updateOffice({
            officeId: req.params.officeId,
            data
        });

    return res.status(200).json(
        successResponse({
            message: 'Office updated successfully.',
            data: office,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const deleteOffice = asyncHandler(async (req, res) => {

    await officeService.deleteOffice({
        officeId: req.params.officeId
    });

    return res.status(200).json(
        successResponse({
            message: 'Office deleted successfully.',
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});