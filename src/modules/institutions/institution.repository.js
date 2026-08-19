import prisma from '../../config/prisma.js';

export const create = async ({ tx = prisma, data }) => {
    return tx.institution.create({ data });
};

export const findById = async ({ tx = prisma, institutionId }) => {
    return tx.institution.findUnique({
        where: { id: institutionId }
    });
};

export const findByCode = async ({ tx = prisma, code }) => {
    return tx.institution.findUnique({
        where: { code }
    });
};

export const findMany = async ({ tx = prisma, where, skip, take }) => {
    return tx.institution.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' }
    });
};

export const count = async ({ tx = prisma, where }) => {
    return tx.institution.count({ where });
};

export const update = async ({ tx = prisma, institutionId, data }) => {
    return tx.institution.update({
        where: { id: institutionId },
        data
    });
};

export const updateLogo = async ({ tx = prisma, institutionId, logoUrl }) => {
    return tx.institution.update({
        where: { id: institutionId },
        data: { logoUrl }
    });
};

export const remove = async ({ tx = prisma, institutionId }) => {
    return tx.institution.delete({
        where: { id: institutionId }
    });
};
