import { z } from 'zod';

const getOfficesSchema = z.object({

    page: z
        .coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10),

    search: z
        .string()
        .trim()
        .optional(),

    officeType: z.enum([
        'SCHOOL',
        'DIVISION_OFFICE'
    ]).optional()
});

export const validateGetOffices = (query) =>
    getOfficesSchema.parse(query);