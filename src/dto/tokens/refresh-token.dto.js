import { z } from 'zod';
import { validateOrThrow } from '../../validators/index.js';

const refreshTokenSchema = z.object({
    refreshToken: z
        .string()
        .trim()
        .min(1, 'Refresh token is required.')
});

export const validateRefreshToken = (body) => {
    return validateOrThrow(refreshTokenSchema, body);
};