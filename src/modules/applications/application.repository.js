import prisma from '../../config/prisma.js';

export const findAll = ({ where, orderBy } = {}) => {

    return prisma.application.findMany({
        where,
        orderBy
    });
};

export const findById = ({ id, include  }) => {

    return prisma.application.findUnique({
        where: {
            id
        },
        include
    });
};

export const findByCode = ({ code }) => {

    return prisma.application.findUnique({
        where: {
            code
        }
    });
};

export const findByBaseUrl = ({ baseUrl }) => {

    return prisma.application.findFirst({
        where: {
            baseUrl
        }
    });
};

export const create = ({ tx = prisma, data }) => {

    console.log(data);

    return tx.application.create({
        data
    });
};

export const update = ({ tx = prisma, id,  data }) => {

    return tx.application.update({
        where: {
            id
        },
        data
    });
};

export const remove = ({ tx = prisma, id }) => {

    return tx.application.delete({
        where: {
            id
        }
    });
};