import prisma from '../../config/prisma.js';

export const findByUserId = async ({ tx = prisma, userId }) => {

    return tx.userProfile.findUnique({

        where: {
            userId
        },

        include: {
            office: true,
            institution: true,
            user: true
        }
    });
};

export const update = async ({ tx = prisma, userId, data }) => {

    return tx.userProfile.update({
        where: { userId },
        data,
        include: {
            office: true,
            institution: true,
            user: true
        }
    });
};

export const create = async ({ tx = prisma, data }) => {

    return tx.userProfile.create({
        data,
        include: {
            office: true,
            institution: true,
            user: true
        }
    });
};

export const updateAvatar = async ({
    tx = prisma,
    userId,
    avatar
}) => {

    return tx.userProfile.update({
        where: { userId },
        data: { avatar },
        include: {
            office: true,
            institution: true,
            user: true
        }
    });
};