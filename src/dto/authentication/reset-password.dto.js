import { z } from 'zod';
import { validateOrThrow } from '../../validators/index.js';

const resetPasswordSchema = z.object({

    token: z
        .string()
        .trim()
        .min(1, 'Reset token is required.'),

    password: z
        .string()
        .min(8)
        .max(100),

    confirmPassword: z
        .string()

}).refine(
    data => data.password === data.confirmPassword,
    {
        path: ['confirmPassword'],
        message: 'Passwords do not match.'
    }
);

export const validateResetPassword = (body) => {
    return validateOrThrow(resetPasswordSchema, body);
};