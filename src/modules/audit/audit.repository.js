import prisma from '../../config/prisma.js';

export const create = async ({ tx = prisma, data }) => {
    return tx.auditLog.create({ data });
};

export const findMany = async ({ tx = prisma, where = {}, skip = 0, take = 10 }) => {
    return tx.auditLog.findMany({
        where,
        include: {
            user: {
                include: {
                    profile: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        skip,
        take
    });
};

export const count = async ({ tx = prisma, where = {} }) => {
    return tx.auditLog.count({
        where
    });
};

export const findById = async ({ tx = prisma, auditLogId }) => {
    return tx.auditLog.findUnique({
        where: {
            id: auditLogId
        },
        include: {
            user: {
                include: {
                    profile: true
                }
            }
        }
    });
};

