import { z } from 'zod';

export const disableSchema = z.object({
    password: z
        .string()
        .min(1, 'Password is required.'),

    token: z
        .string()
        .length(6, 'Authenticator code must be 6 digits.')
});

export const validateDisable = (data) =>
    disableSchema.parse(data);