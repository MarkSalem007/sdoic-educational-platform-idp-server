import prisma from "../../config/prisma.js";


export const create = async ({ tx = prisma, data }) => {
    return tx.office.create({ data });
};

export const findById = async ({ tx = prisma, officeId }) => {
    return tx.office.findFirst({ 
        where: {
            id: officeId
        }
    });
};

export const findByOfficeCode = async ({ tx = prisma, officeCode }) => {
    return tx.office.findUnique({
        where: {
            officeCode
        }
    });
};

export const findMany = async ({ tx = prisma, where, skip, take }) => {
    return tx.office.findMany({ 
        where, 
        skip, 
        take,
        orderBy: {
            officeName: 'asc'
        }
    });
};

export const count = async ({ tx = prisma, where }) => {
    return tx.office.count({ where });
};

export const update = async ({ tx = prisma, officeId, data }) => {
    return tx.office.update({ 
        where: {
            id: officeId
        },
        data 
    });
};

export const remove = async ({ tx = prisma, officeId }) => {
    return tx.office.delete({
        where: {
            id: officeId
        }
    });
};