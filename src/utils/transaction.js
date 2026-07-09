import prisma from '../config/prisma.js';

export const withTransaction = async (callback) => {

    return prisma.$transaction(async (tx) => {

        return callback(tx);

    });

};