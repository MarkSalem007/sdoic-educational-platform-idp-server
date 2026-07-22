import { z } from 'zod';

export const verifyTwoFactorSchema = z.object({
    challenge: z
        .string()
        .uuid(),

    code: z
        .string()
        .trim()
        .regex(/^\d{6}$/, 'Authentication code must be 6 digits.')
});

export const validateVerifyTwoFactor = (data) => {
    return z.object({
        challenge: z.string().uuid(),
        code: z.string().trim().length(6)
    }).parse(data);
};