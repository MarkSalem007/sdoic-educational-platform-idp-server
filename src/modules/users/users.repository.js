import prisma from '../../config/prisma.js';

export const findById = async ({ tx = prisma, userId } = {}) => {
    return tx.user.findUnique({
        where: { id: userId },
        include: {
            profile: {
                include: {
                    office: true,
                    institution: true
                }
            }
        }
    });
};

export const findByEmail = async ({ tx = prisma, email } = {}) => {
    return tx.user.findUnique({
        where: { email },
        include: {
            profile: {
                include: {
                    office: true,
                    institution: true
                }
            }
        }
    });
};

export const findByMobileNumber = async ({ tx = prisma, mobileNumber } = {}) => {
    return tx.userProfile.findUnique({
        where: { mobileNumber },
        include: { user: true }
    });
};

export const createUser = async ({ tx = prisma, data } = {}) => {
    return tx.user.create({ data });
};

export const createProfile = async ({ tx = prisma, data } = {}) => {
    return tx.userProfile.create({ data });
};

export const updateUser = async ({ tx = prisma, userId, data} = {}) => {
    return tx.user.update({
        where: { id: userId },
        data,
        include: {
            profile: {
                include: {
                    office: true,
                    institution: true
                }
            }
        }
    });
};


export const updateProfile = async ({ tx = prisma, userId, data } = {}) => {
    return tx.userProfile.update({
        where: { userId },
        data,
    });
};

export const findAll = async ({ tx = prisma, skip, take, search, status, sortBy, sortOrder } = {}) => {

    const where = {};

    if (status) {where.status = status;}

    if (search) {
        where.OR = [
            { email: {contains: search} },
            { profile: { firstName: { contains: search } } },
            { profile: { middleName: { contains: search } } },
            { profile: { lastName: { contains: search } } },
            { profile: { mobileNumber: { contains: search } } }
        ];
    }

    let orderBy = {};

    switch (sortBy) {
        case 'firstName':
            orderBy = {profile: {firstName: sortOrder}};
            break;
        case 'lastName':
            orderBy = {profile: {lastName: sortOrder}};
            break;
        default:
            orderBy = { [sortBy]: sortOrder};
    }

    return tx.user.findMany({
        where,
        skip,
        take,
        include: {
            profile: {
                include: {
                    office: true,
                    institution: true
                }
            }
        },
        orderBy
    });
};

export const count = async ({ tx = prisma, search, status } = {}) => {
    const where = {};

    if (status) {
        where.status = status;
    }

    if (search) {
        where.OR = [
            {email: {contains: search}},
            {profile: {firstName: {contains: search}}},
            {profile: {middleName: {contains: search}}},
            {profile: {lastName: {contains: search}}},
            {profile: {mobileNumber: {contains: search}}}
        ];
    }

    return tx.user.count({
        where
    });
};