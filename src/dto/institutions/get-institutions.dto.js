import { z } from 'zod';

const getInstitutionsSchema = z.object({

    page: z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 1))
        .pipe(z.number().int().min(1)),

    limit: z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 10))
        .pipe(z.number().int().min(1).max(100)),

    search: z
        .string()
        .trim()
        .optional(),

    isActive: z
        .string()
        .optional()
        .transform(val => {
            if (val === 'true') return true;
            if (val === 'false') return false;
            return undefined;
        })

});

export const validateGetInstitutions = (data) =>
    getInstitutionsSchema.parse(data);
