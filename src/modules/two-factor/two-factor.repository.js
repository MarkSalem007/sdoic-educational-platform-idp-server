import prisma from '../../config/prisma.js';

export const findByUserId = async ({ tx = prisma, userId }) => {
    return tx.userTwoFactor.findUnique({
        where: {
            userId
        },
        include: {
            backupCodes: true
        }
    });
};

export const create = async ({ tx = prisma, data }) => {
    return tx.userTwoFactor.create({
        data
    });
};

export const update = async ({ tx = prisma, userId, data }) => {
    return tx.userTwoFactor.update({
        where: {
            userId
        },
        data
    });
};

export const remove = async ({ tx = prisma, userId }) => {
    return tx.userTwoFactor.delete({
        where: {
            userId
        }
    });
};

export const createBackupCodes = async ({ tx = prisma, codes }) => {
    return tx.userTwoFactorBackupCode.createMany({
        data: codes
    });
};

export const deleteBackupCodes = async ({ tx = prisma, twoFactorId }) => {
    return tx.userTwoFactorBackupCode.deleteMany({
        where: {
            twoFactorId
        }
    });
};

export const markBackupCodeUsed = async ({ tx = prisma, backupCodeId }) => {
    return tx.userTwoFactorBackupCode.update({
        where: {
            id: backupCodeId
        },
        data: {
            usedAt: new Date()
        }
    });
};

export const resetFailedAttempts = async ({ tx = prisma, userId }) => {
    return update({
        tx,
        userId,
        data: {
            failedAttempts: 0,
            lockedUntil: null
        }
    });
};

export const incrementFailedAttempts = async ({ tx = prisma, userId, failedAttempts, lockedUntil }) => {
    return update({
        tx,
        userId,
        data: {
            failedAttempts,
            lockedUntil
        }
    });
};

export const updateLastUsed = async ({ tx = prisma, userId }) => {
    return update({
        tx,
        userId,
        data: {
            lastTotpUsedAt: new Date()
        }
    });
};

export const updateLastTotpCounter = async ({ tx = prisma, userId, counter }) => {
    return tx.userTwoFactor.update({
        where: {
            userId
        },
        data: {
            lastTotpCounter: counter
        }
    });
};

export const deleteChallenges = ({ tx = prisma, userId }) => {
    return tx.userTwoFactorChallenge.deleteMany({
        where: {
            userId
        }
    });
};


