import { z } from 'zod';

const createOfficeSchema = z.object({

    officeName: z
        .string()
        .trim()
        .min(1, 'Office name is required.')
        .max(255),

    officeType: z.enum([
        'SCHOOLS_DIVISION_OF_IMUS_CITY',
        'SCHOOLS_IMUS_CITY'
    ]),

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

export const validateCreateOffice = (data) =>
    createOfficeSchema.parse(data);