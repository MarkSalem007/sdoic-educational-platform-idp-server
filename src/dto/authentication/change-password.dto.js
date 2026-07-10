import { z } from 'zod';
import { validateOrThrow } from '../../validators/index.js';

const changePasswordSchema = z.object({

    currentPassword: z
        .string()
        .min(1, 'Current password is required.'),

    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .max(100)

});

export const validateChangePassword = (body) => {
    return validateOrThrow(changePasswordSchema, body);
};