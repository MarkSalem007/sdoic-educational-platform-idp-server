import * as permissionsRepository from './permissions.repository.js';
import prisma from '../../config/prisma.js';

export const getAllPermissions = async () => {
    return await permissionsRepository.findAllPermissions({});
};

export const getPermissionsByRole = async (roleId) => {
    return await permissionsRepository.findPermissionsByRole({ roleId });
};

export const assignPermissionToRole = async (roleId, permissionId) => {
    try {
        const assigned = await permissionsRepository.assignPermissionToRole({ roleId, permissionId });
        return { success: true, data: assigned };
    } catch (error) {
        if (error.code === 'P2002') {
            return { success: false, message: 'Permission already assigned to this role' };
        }
        throw error;
    }
};

export const removePermissionFromRole = async (roleId, permissionId) => {
    try {
        const removed = await permissionsRepository.removePermissionFromRole({ roleId, permissionId });
        return { success: true, data: removed };
    } catch (error) {
        if (error.code === 'P2025') {
            return { success: false, message: 'Permission not assigned to this role' };
        }
        throw error;
    }
};

export const getById = async (id) => {
    const permission = await permissionsRepository.findById({ id });
    if (!permission) throw new Error('Permission not found');
    return permission;
};

export const create = async (data) => {
    try {
        return await permissionsRepository.create({ data });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error('Permission code already exists');
        }
        throw error;
    }
};

export const update = async (id, data) => {
    await getById(id);
    try {
        return await permissionsRepository.update({ id, data });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error('Permission code already exists');
        }
        throw error;
    }
};

export const remove = async (id) => {
    await getById(id);
    try {
        return await permissionsRepository.remove({ id });
    } catch (error) {
        if (error.code === 'P2003') {
            throw new Error('Cannot delete permission because it is assigned to roles');
        }
        throw error;
    }
};

export const getUserPermissions = async (userId) => {
    const [overrides, roleAssignments] = await Promise.all([
        permissionsRepository.findUserPermissionOverrides({ userId }),
        permissionsRepository.findUserRolePermissions({ userId })
    ]);

    const rolePermissions = roleAssignments.flatMap(ra =>
        ra.role?.permissions?.map(rp => ({
            permissionId: rp.permissionId,
            roleId: ra.role.id,
            roleName: ra.role.name,
            permission: rp.permission
        })) || []
    );

    return {
        overrides,
        rolePermissions
    };
};

export const setUserPermissionOverride = async ({ userId, permissionId, effect, assignedBy }) => {
    if (!['GRANT', 'DENY'].includes(effect)) {
        throw new Error('Invalid effect. Must be GRANT or DENY.');
    }
    const override = await permissionsRepository.setUserPermissionOverride({
        userId,
        permissionId,
        effect,
        assignedBy
    });
    return { success: true, data: override };
};

export const removeUserPermissionOverride = async ({ userId, permissionId }) => {
    try {
        const removed = await permissionsRepository.removeUserPermissionOverride({ userId, permissionId });
        return { success: true, data: removed };
    } catch (error) {
        if (error.code === 'P2025') {
            return { success: false, message: 'No override found for this permission' };
        }
        throw error;
    }
};

