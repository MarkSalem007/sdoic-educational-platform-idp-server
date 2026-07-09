import { z } from 'zod';
import { validate } from '../../utils/index.js';
import { email, requiredText } from '../../validators/index.js';
import { ValidationError } from '../../errors/index.js';

export const loginSchema = z.object({
    email,
    password: requiredText('Password', 128)
}).strict();

export const validateLogin = (payload) => {
    const result = validate(loginSchema, payload);
    if (!result.success) {
        throw new ValidationError(result.errors);
    }
    return result.data;
};