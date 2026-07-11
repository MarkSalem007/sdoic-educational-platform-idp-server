import prisma from '../../config/prisma.js';

export const create = async ({ tx = prisma, data }) => {
    return tx.userSession.create({ data });
};

export const findById = async ({ tx = prisma, sessionId }) => {
    return tx.userSession.findUnique({
        where: {
            id: sessionId
        }
    });
};

export const findByJti = async ({ tx = prisma, jti }) => {
    return tx.userSession.findUnique({ where: { jti } });
};

export const revoke = async ({ tx = prisma, sessionId }) => {
    return tx.userSession.update({
        where: { id: sessionId },
        data: {
            isRevoked: true,
            revokedAt: new Date()
        }
    });
};

export const revokeAllByUser = async ({ tx = prisma, userId }) => {
    return tx.userSession.updateMany({
        where: {
            userId,
            isRevoked: false
        },
        data: {
            isRevoked: true,
            revokedAt: new Date()
        }
    });
};

export const deleteExpired = async ({ tx = prisma }) => {
    return tx.userSession.deleteMany({
        where: {
            expiresAt: {
                lt: new Date()
            }
        }
    });
};

export const revokeAllRefreshTokensByUser = async ({ tx = prisma, userId }) => {
    return tx.userRefreshToken.updateMany({
        where: {
            isRevoked: false,
            session: {
                userId
            }
        },
        data: {
            isRevoked: true,
            revokedAt: new Date()
        }
    });
};

export const update = async ({
    tx = prisma,
    sessionId,
    data
}) => {
    return tx.userSession.update({
        where: {
            id: sessionId
        },
        data
    });
};

export const findAllByUser = async ({ tx = prisma, userId }) => {
    return tx.userSession.findMany({
        where: {
            userId,
            isRevoked: false
        },
        orderBy: {
            lastActivity: 'desc'
        }
    });
};

export const findWithUser = async ({ tx = prisma, sessionId }) => {
    return tx.userSession.findUnique({
        where: {
            id: sessionId
        },

        include: {
            user: true
        }
    });
};

export const revokeRefreshTokenBySession = async ({
    tx = prisma,
    sessionId
}) => {

    return tx.userRefreshToken.updateMany({

        where: {
            sessionId,
            isRevoked: false
        },

        data: {
            isRevoked: true,
            revokedAt: new Date()
        }

    });

};