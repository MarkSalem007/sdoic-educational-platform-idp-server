import * as rolesService from './roles.services.js';
import asyncHandler from '../../utils/async-handler.js';

export const createRole = asyncHandler(async (req, res) => {
    const role = await rolesService.createRole({
        data: req.body,
        context: req.context
    });
    res.status(201).json(role);
});

export const updateRole = asyncHandler(async (req, res) => {
    const role = await rolesService.updateRole({
        roleId: req.params.id,
        data: req.body,
        context: req.context
    });
    res.json(role);
});

export const getById = asyncHandler(async (req, res) => {
    const role = await rolesService.getById({
        roleId: req.params.id
    });
    res.json(role);
});

export const getAll = asyncHandler(async (req, res) => {
    const result = await rolesService.getAll({
        query: req.query
    });
    res.json(result);
});

export const deleteRole = asyncHandler(async (req, res) => {
    await rolesService.deleteRole({
        roleId: req.params.id,
        context: req.context
    });
    res.status(204).end();
});

export const assignRole = asyncHandler(async (req, res) => {
    await rolesService.assignRole({
        userId: req.body.userId,
        roleId: req.body.roleId,
        assignedBy: req.user?.id || 'system',
        context: req.context
    });
    res.status(200).json({ message: 'Role assigned successfully.' });
});

export const revokeRole = asyncHandler(async (req, res) => {
    await rolesService.revokeRole({
        userId: req.params.userId,
        roleId: req.params.roleId,
        context: req.context
    });
    res.status(204).end();
});

export const getUserRoles = asyncHandler(async (req, res) => {
    const roles = await rolesService.getUserRoles({
        userId: req.params.userId
    });
    res.json(roles);
});
