import { z } from 'zod';

export const verifySetupSchema = z.object({
    token: z
        .string()
        .trim()
        .length(6, 'Authenticator code must be 6 digits.')
        .regex(/^\d+$/, 'Authenticator code must contain only numbers.')

});

export const validateVerifySetup = (data) =>
    verifySetupSchema.parse(data);