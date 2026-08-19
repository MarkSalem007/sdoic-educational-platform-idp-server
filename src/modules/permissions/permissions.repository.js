import prisma from '../../config/prisma.js';

export const findAllPermissions = async ({ tx = prisma }) => {
    return tx.permission.findMany({
        include: {
            module: {
                include: {
                    application: true
                }
            }
        },
        orderBy: [
            { module: { application: { name: 'asc' } } },
            { module: { displayOrder: 'asc' } },
            { name: 'asc' }
        ]
    });
};

export const findPermissionsByRole = async ({ roleId, tx = prisma }) => {
    return tx.rolePermission.findMany({
        where: { roleId },
        include: { permission: true }
    });
};

export const assignPermissionToRole = async ({ roleId, permissionId, tx = prisma }) => {
    return tx.rolePermission.create({
        data: {
            roleId,
            permissionId
        }
    });
};

export const removePermissionFromRole = async ({ roleId, permissionId, tx = prisma }) => {
    return tx.rolePermission.delete({
        where: {
            roleId_permissionId: {
                roleId,
                permissionId
            }
        }
    });
};

export const removeAllPermissionsFromRole = async ({ roleId, tx = prisma }) => {
    return tx.rolePermission.deleteMany({
        where: { roleId }
    });
};

export const findById = async ({ id, tx = prisma }) => {
    return tx.permission.findUnique({
        where: { id },
        include: {
            module: {
                include: { application: true }
            }
        }
    });
};

export const create = async ({ data, tx = prisma }) => {
    return tx.permission.create({ data });
};

export const update = async ({ id, data, tx = prisma }) => {
    return tx.permission.update({
        where: { id },
        data
    });
};

export const remove = async ({ id, tx = prisma }) => {
    return tx.permission.delete({
        where: { id }
    });
};
