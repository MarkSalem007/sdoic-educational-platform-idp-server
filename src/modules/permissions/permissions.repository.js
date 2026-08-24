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

export const findUserPermissionOverrides = async ({ userId, tx = prisma }) => {
    return tx.userPermission.findMany({
        where: { userId },
        include: { permission: true }
    });
};

export const findUserRolePermissions = async ({ userId, tx = prisma }) => {
    return tx.roleAssignment.findMany({
        where: { userId },
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            }
        }
    });
};

export const setUserPermissionOverride = async ({ userId, permissionId, effect, assignedBy, tx = prisma }) => {
    return tx.userPermission.upsert({
        where: {
            userId_permissionId: {
                userId,
                permissionId
            }
        },
        create: {
            userId,
            permissionId,
            effect,
            assignedBy
        },
        update: {
            effect,
            assignedBy,
            assignedAt: new Date()
        }
    });
};

export const removeUserPermissionOverride = async ({ userId, permissionId, tx = prisma }) => {
    return tx.userPermission.delete({
        where: {
            userId_permissionId: {
                userId,
                permissionId
            }
        }
    });
};

