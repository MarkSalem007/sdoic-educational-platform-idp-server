import * as usersService from './users.services.js';
import { validateCreateUser } from '../../dto/users/create-user.dto.js';
import { asyncHandler, successResponse, toISOString } from '../../utils/index.js';
import { mapUpdateUserRequest } from '../../dto/users/update-user.dto.js';

export const createUser = asyncHandler(async (req, res) => {
    const data = validateCreateUser(req.body);
    const result = await usersService.createUser({
        data,
        context: req.context
    });

    return res.status(201).json(
        successResponse({
            message: 'User created successfully.',
            data: result,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const update = asyncHandler(async (req, res) => {
    const data = mapUpdateUserRequest(req.body);
    const user =await usersService.update({
            userId: req.params.id,
            data,
            context: req.context
        });

    return res.status(200).json(
        successResponse({
            message: 'User updated successfully.',
            data: user,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const getById = asyncHandler(async (req, res) => {
    const user = await usersService.getById({userId: req.params.id});
    return res.status(200).json(
        successResponse({
            message: 'User Retrieved successfully.',
            data: user,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const getAll = asyncHandler(async (req, res) => {
    console.log(req.query);
    const result = await usersService.getAll({ query: req.query });
    return res.status(200).json(
        successResponse({
            message: 'Users retrieved successfully.',
            data: result.users,
            meta: result.meta,
            requestId: req.requestId
        })
    );
});

export const bulkImport = asyncHandler(async (req, res) => {
    const { users } = req.body;
    if (!users || !Array.isArray(users)) {
        return res.status(400).json({ success: false, message: 'Invalid payload: users array is required.' });
    }

    const result = await usersService.bulkImport({
        users,
        context: req.context
    });

    return res.status(200).json(
        successResponse({
            message: 'Bulk import processed.',
            data: result,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const exportCredentials = asyncHandler(async (req, res) => {
    const { roleId } = req.body;
    
    const data = await usersService.exportCredentials({
        roleId,
        context: req.context
    });

    return res.status(200).json(
        successResponse({
            message: 'Credentials exported successfully.',
            data,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

