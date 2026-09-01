import { z } from 'zod';

const SCHOOL_LEVELS = ['ELEMENTARY', 'JUNIOR_HIGH_SCHOOL', 'SENIOR_HIGH_SCHOOL', 'INTEGRATED_SCHOOL'];

const updateOfficeSchema = z.object({

    officeName: z
        .string()
        .trim()
        .min(1)
        .max(255)
        .optional(),

    officeType: z.enum([
        'SCHOOL',
        'DIVISION_OFFICE'
    ]).optional(),

    schoolLevel: z
        .enum(SCHOOL_LEVELS)
        .optional()
        .nullable(),

    schoolLogo: z
        .string()
        .trim()
        .optional()
        .nullable(),

    officeCode: z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),

    officeHead: z
        .string()
        .trim()
        .max(255)
        .optional()
        .nullable(),

    officeAddress: z
        .string()
        .trim()
        .optional()
        .nullable(),

    officeEmail: z
        .email()
        .optional()
        .nullable(),

    officeContact: z
        .string()
        .trim()
        .max(50)
        .optional()
        .nullable()

});

export const validateUpdateOffice = (data) =>
    updateOfficeSchema.parse(data);