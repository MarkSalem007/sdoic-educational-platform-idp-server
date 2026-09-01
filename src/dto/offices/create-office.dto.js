import { z } from 'zod';

const SCHOOL_LEVELS = ['ELEMENTARY', 'JUNIOR_HIGH_SCHOOL', 'SENIOR_HIGH_SCHOOL', 'INTEGRATED_SCHOOL'];

const createOfficeSchema = z.object({

    officeName: z
        .string()
        .trim()
        .min(1, 'Office name is required.')
        .max(255),

    officeType: z.enum([
        'SCHOOL',
        'DIVISION_OFFICE'
    ]),

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

export const validateCreateOffice = (data) =>
    createOfficeSchema.parse(data);