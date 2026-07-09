import { z } from 'zod';
import { validateOrThrow } from '../../validators/index.js';
import { userStatus } from '@prisma/client';

export const getUsersSchema = z.object({

    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    pageSize: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10),

    search: z
        .string()
        .trim()
        .optional(),

    status: z
        .nativeEnum(userStatus)
        .optional(),

    sortBy: z
        .enum([
            'email',
            'createdAt',
            'updatedAt',
            'status',
            'lastName',
            'firstName'
        ])
        .default('createdAt'),

    sortOrder: z
        .enum([
            'asc',
            'desc'
        ])
        .default('desc')

});

export const parseGetUsersQuery = (query) => {
    return validateOrThrow(getUsersSchema, query);
};