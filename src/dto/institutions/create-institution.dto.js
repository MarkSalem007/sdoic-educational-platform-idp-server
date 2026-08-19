import { z } from 'zod';

const createInstitutionSchema = z.object({

    code: z
        .string()
        .trim()
        .min(1, 'Institution code is required.')
        .max(50),

    name: z
        .string()
        .trim()
        .min(1, 'Institution name is required.')
        .max(255),

    shortName: z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),

    // Address
    addressLine1: z
        .string()
        .trim()
        .max(255)
        .optional()
        .nullable(),

    addressLine2: z
        .string()
        .trim()
        .max(255)
        .optional()
        .nullable(),

    city: z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),

    province: z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),

    region: z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),

    // Contact
    contactNumber: z
        .string()
        .trim()
        .max(50)
        .optional()
        .nullable(),

    email: z
        .string()
        .email()
        .optional()
        .nullable(),

    // Header / Footer lines
    headerLine1: z.string().trim().max(255).optional().nullable(),
    headerLine2: z.string().trim().max(255).optional().nullable(),
    headerLine3: z.string().trim().max(255).optional().nullable(),

    footerLine1: z.string().trim().max(255).optional().nullable(),
    footerLine2: z.string().trim().max(255).optional().nullable(),

    isActive: z.boolean().optional()

});

export const validateCreateInstitution = (data) =>
    createInstitutionSchema.parse(data);
