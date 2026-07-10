import prisma from '../../config/prisma.js';
import { addMinutes } from '../../utils/index.js';


export const findUserByEmail = async ({ email, tx = prisma }) => {
    return tx.user.findUnique({
        where: { email },
        include: { profile: true }
    });
};

export const incrementFailedLoginAttempts = async ({ tx = prisma, userId }) => {
    return tx.user.update({
        where: {
            id: userId
        },
        data: {
            failedLoginAttempts: {
                increment: 1
            }
        }
    });
};

export const resetFailedLoginAttempts = async ({ tx = prisma, userId }) => {
    return tx.user.update({
        where: {
            id: userId
        },
        data: {
            failedLoginAttempts: 0,
            lockedUntil: null
        }
    });
};

export const createSession = async ({ data, tx = prisma }) => {
    return tx.userSession.create({
        data
    });
};

export const findSessionById = async ({ sessionId, tx = prisma }) => {
    return tx.userSession.findUnique({
        where: {
            id: sessionId
        }
    });
};

export const updateLastActivity = async ({ sessionId, lastActivity, tx = prisma }) => {
    return tx.userSession.update({
        where: {
            id: sessionId
        },
        data: {
            lastActivity
        }
    });
};

export const revokeSession = async ({ sessionId, tx = prisma }) => {
    return tx.userSession.update({
        where: {
            id: sessionId
        },
        data: {
            isRevoked: true,
            revokedAt: new Date()
        }
    });
};

export const createRefreshToken = async ({ data, tx = prisma }) => {
    return tx.userRefreshToken.create({
        data
    });
};

export const findRefreshTokenByHash = async ({ tokenHash, tx = prisma }) => {
    return tx.userRefreshToken.findUnique({
        where: {
            tokenHash
        }
    });
};

export const revokeRefreshToken = async ({ refreshTokenId, tx = prisma }) => {
    return tx.userRefreshToken.update({
        where: {
            id: refreshTokenId
        },
        data: {
            isRevoked: true,
            revokedAt: new Date()
        }
    });
};

export const revokeRefreshTokenBySessionId = async ({ tx = prisma, sessionId }) => {
    return tx.userRefreshToken.updateMany({
        where: { sessionId, isRevoked: false },
        data: { isRevoked: true, revokedAt: new Date() }
    });
};

export const lockAccount = async ({ tx = prisma, userId, lockMinutes }) => {
    return tx.user.update({
        where: {
            id: userId
        },
        data: {
            lockedUntil: addMinutes(
                lockMinutes
            )
        }
    });
};

export const findUserById = async ({
    userId,
    tx = prisma
}) => {

    return tx.user.findUnique({
        where: {
            id: userId
        },
        include: {
            profile: true
        }
    });

};

export const findSessionWithUser = async ({
    sessionId,
    tx = prisma
}) => {

    return tx.userSession.findUnique({

        where: {
            id: sessionId
        },

        include: {
            user: {
                include: {
                    profile: true
                }
            }
        }
    })
};

export const findRefreshTokenWithSession = async ({
    tokenHash, tx = prisma
}) => {
    return tx.userRefreshToken.findUnique({
        where: {
            tokenHash
        },
        include: {
            session: {
                include: {
                    user: {
                        include: {
                            profile: true
                        }
                    }
                }
            }
        }
    });
};

export const changePassword = async ({ tx = prisma, userId, passwordHash, passwordVersion }) => {
    return tx.user.update({
        where: { id: userId },
        data: { passwordHash, passwordVersion: {
            increment: 1
        }, mustChangePassword: false }
    });
};




