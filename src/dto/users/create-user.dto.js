import { z } from 'zod';
import { validate } from '../../utils/index.js';
import { ValidationError } from '../../errors/index.js';
import {
    email,
    requiredText,
    optionalText,
    mobileNumber
} from '../../validators/index.js';

export const createUserSchema = z.object({
    email,
    firstName: requiredText('First name', 100),
    middleName: optionalText(100),
    lastName: requiredText('Last name', 100),
    suffix: optionalText(30),
    mobileNumber: mobileNumber.optional().nullable()
}).strict();

export const validateCreateUser = (payload) => {
    const result = validate(createUserSchema, payload);
    if (!result.success) {
        throw new ValidationError(result.errors);
    }
    return result.data;
};