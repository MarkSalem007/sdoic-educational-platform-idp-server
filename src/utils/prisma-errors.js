import { Prisma } from '@prisma/client';
import {
    ConflictError,
    InternalServerError
} from '../errors/index.js';

export const handlePrismaError = (error) => {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        throw error;
    }
    switch (error.code) {
        case 'P2002':
            throw new ConflictError(
                'RESOURCE_ALREADY_EXISTS',
                'The resource already exists.'
            );
        case 'P2025':
            throw new ConflictError(
                'RESOURCE_NOT_FOUND',
                'The requested resource does not exist.'
            );
        default:
            throw new InternalServerError();
    }
};