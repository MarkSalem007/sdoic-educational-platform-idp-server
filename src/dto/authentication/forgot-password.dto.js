import { z } from 'zod';
import { validateOrThrow } from '../../validators/index.js';

const forgotPasswordSchema = z.object({

    email: z
        .string()
        .trim()
        .email()

});

export const validateForgotPassword = (body) => {
    return validateOrThrow(forgotPasswordSchema, body);
};