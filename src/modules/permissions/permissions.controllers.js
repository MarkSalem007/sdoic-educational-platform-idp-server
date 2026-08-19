import * as permissionsService from './permissions.services.js';
import asyncHandler from '../../utils/async-handler.js';

export const getAllPermissions = asyncHandler(async (req, res) => {
    const permissions = await permissionsService.getAllPermissions();
    res.json({ data: permissions });
});

export const getPermissionsByRole = asyncHandler(async (req, res) => {
    const { roleId } = req.params;
    const permissions = await permissionsService.getPermissionsByRole(roleId);
    res.json({ data: permissions });
});

export const assignPermissionToRole = asyncHandler(async (req, res) => {
    const { roleId } = req.params;
    const { permissionId } = req.body;
    
    if (!permissionId) {
        return res.status(400).json({ message: 'permissionId is required', success: false });
    }

    const result = await permissionsService.assignPermissionToRole(roleId, permissionId);
    if (!result.success) {
        return res.status(400).json({ message: result.message, success: false });
    }
    
    res.status(201).json({ message: 'Permission assigned successfully', data: result.data });
});

export const removePermissionFromRole = asyncHandler(async (req, res) => {
    const { roleId, permissionId } = req.params;
    
    const result = await permissionsService.removePermissionFromRole(roleId, permissionId);
    if (!result.success) {
        return res.status(404).json({ message: result.message, success: false });
    }
    
    res.json({ message: 'Permission removed successfully' });
});

export const getById = asyncHandler(async (req, res) => {
    try {
        const data = await permissionsService.getById(req.params.id);
        res.json({ data });
    } catch (error) {
        res.status(404).json({ message: error.message, success: false });
    }
});

export const create = asyncHandler(async (req, res) => {
    try {
        const data = await permissionsService.create(req.body);
        res.status(201).json({ message: 'Permission created successfully', data });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
});

export const update = asyncHandler(async (req, res) => {
    try {
        const data = await permissionsService.update(req.params.id, req.body);
        res.json({ message: 'Permission updated successfully', data });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
});

export const remove = asyncHandler(async (req, res) => {
    try {
        await permissionsService.remove(req.params.id);
        res.json({ message: 'Permission deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
});
