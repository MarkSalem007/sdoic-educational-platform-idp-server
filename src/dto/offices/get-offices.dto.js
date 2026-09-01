import { z } from 'zod';

const SCHOOL_LEVELS = ['ELEMENTARY', 'JUNIOR_HIGH_SCHOOL', 'SENIOR_HIGH_SCHOOL', 'INTEGRATED_SCHOOL'];

const getOfficesSchema = z.object({

    page: z
        .coerce
        .number()
        .int()
        .min(1)
        .default(1),

    // 0 = no limit (fetch all). Positive integers = paginated.
    limit: z
        .coerce
        .number()
        .int()
        .min(0)
        .default(10),

    search: z
        .string()
        .trim()
        .optional(),

    officeType: z.enum([
        'SCHOOL',
        'DIVISION_OFFICE'
    ]).optional(),

    schoolLevel: z
        .enum(SCHOOL_LEVELS)
        .optional()
});

export const validateGetOffices = (query) =>
    getOfficesSchema.parse(query);