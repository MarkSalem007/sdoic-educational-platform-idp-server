import { z } from 'zod';

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