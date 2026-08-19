import prisma from '../../config/prisma.js';

export const findAll = async ({ skip = 0, take = 50, search, tx }) => {
    const db = tx || prisma;
    const where = {};

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { code: { contains: search } }
        ];
    }

    return db.role.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { assignments: true, permissions: true }
            }
        }
    });
};

export const count = async ({ search, tx }) => {
    const db = tx || prisma;
    const where = {};

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { code: { contains: search } }
        ];
    }

    return db.role.count({ where });
};

export const findById = async ({ roleId, tx }) => {
    const db = tx || prisma;
    return db.role.findUnique({
        where: { id: roleId },
        include: {
            permissions: {
                include: { permission: true }
            }
        }
    });
};

export const findByCode = async ({ code, tx }) => {
    const db = tx || prisma;
    return db.role.findUnique({
        where: { code }
    });
};

export const createRole = async ({ data, tx }) => {
    const db = tx || prisma;
    return db.role.create({ data });
};

export const updateRole = async ({ roleId, data, tx }) => {
    const db = tx || prisma;
    return db.role.update({
        where: { id: roleId },
        data
    });
};

export const deleteRole = async ({ roleId, tx }) => {
    const db = tx || prisma;
    return db.role.delete({
        where: { id: roleId }
    });
};

export const assignRoleToUser = async ({ data, tx }) => {
    const db = tx || prisma;
    return db.roleAssignment.create({ data });
};

export const removeRoleFromUser = async ({ userId, roleId, tx }) => {
    const db = tx || prisma;
    return db.roleAssignment.delete({
        where: {
            userId_roleId: {
                userId,
                roleId
            }
        }
    });
};

export const getUserRoles = async ({ userId, tx }) => {
    const db = tx || prisma;
    return db.roleAssignment.findMany({
        where: { userId },
        include: { role: true }
    });
};
