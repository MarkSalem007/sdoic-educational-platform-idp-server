import { z } from 'zod';

const applicationType = z.enum([
    'INTERNAL',
    'EXTERNAL'
]);

export const applicationIdSchema = z.object({
    id: z.uuid('Invalid application ID.')
});

export const createApplicationSchema = z.object({

    name: z
        .string()
        .trim()
        .min(1, 'Application name is required.')
        .max(100, 'Application name is too long.'),

    code: z
        .string()
        .trim()
        .min(2, 'Application code is required.')
        .max(50)
        .regex(
            /^[A-Z0-9_]+$/,
            'Application code must contain only uppercase letters, numbers, and underscores.'
        ),

    type: applicationType.default('INTERNAL'),

    description: z
        .string()
        .trim()
        .max(500)
        .optional(),

    logo: z
        .string()
        .trim()
        .max(255)
        .optional(),

    baseUrl: z
        .url('Invalid base URL.'),

    loginUrl: z
        .url('Invalid login URL.')
        .optional(),

    callbackUrl: z
        .url('Invalid callback URL.')
        .optional(),

    displayOrder: z.coerce
        .number()
        .int()
        .min(0)
        .optional(),

    status: z
        .enum([
            'ACTIVE',
            'INACTIVE',
            'MAINTENANCE'
        ])
        .optional()

}).superRefine((data, ctx) => {

    if (data.type === 'INTERNAL') {

        if (!data.loginUrl) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['loginUrl'],
                message: 'Login URL is required for internal applications.'
            });
        }

        if (!data.callbackUrl) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['callbackUrl'],
                message: 'Callback URL is required for internal applications.'
            });
        }

    }

});

export const updateApplicationSchema = z.object({

    name: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),


    type: applicationType.optional(),

    description: z
        .string()
        .trim()
        .max(500)
        .optional(),

    logo: z
        .string()
        .trim()
        .max(255)
        .optional(),

    baseUrl: z
        .url('Invalid base URL.')
        .optional(),

    loginUrl: z
        .url('Invalid login URL.')
        .optional(),

    callbackUrl: z
        .url('Invalid callback URL.')
        .optional(),

    displayOrder: z.coerce
        .number()
        .int()
        .min(0)
        .optional(),

    status: z
        .enum([
            'ACTIVE',
            'INACTIVE',
            'MAINTENANCE'
        ])
        .optional()

}).superRefine((data, ctx) => {

    if (data.type === 'INTERNAL') {

        if (data.loginUrl === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['loginUrl'],
                message: 'Login URL is required for internal applications.'
            });
        }

        if (data.callbackUrl === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['callbackUrl'],
                message: 'Callback URL is required for internal applications.'
            });
        }

    }

});