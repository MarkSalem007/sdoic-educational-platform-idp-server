import prisma from '../../config/prisma.js';

export const create = async ({ tx = prisma, data }) => {
    return tx.auditLog.create({ data });
};