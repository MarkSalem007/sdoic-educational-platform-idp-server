import prisma from '../../config/prisma.js';

export const findAll = async ({ tx = prisma }) => {
    return tx.applicationModule.findMany({
        include: {
            application: true
        },
        orderBy: [
            { application: { name: 'asc' } },
            { displayOrder: 'asc' },
            { name: 'asc' }
        ]
    });
};

export const findById = async ({ id, tx = prisma }) => {
    return tx.applicationModule.findUnique({
        where: { id },
        include: { application: true }
    });
};

export const create = async ({ data, tx = prisma }) => {
    return tx.applicationModule.create({ data });
};

export const update = async ({ id, data, tx = prisma }) => {
    return tx.applicationModule.update({
        where: { id },
        data
    });
};

export const remove = async ({ id, tx = prisma }) => {
    return tx.applicationModule.delete({
        where: { id }
    });
};
