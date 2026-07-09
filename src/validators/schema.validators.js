import { ValidationError } from '../errors/index.js';

export const validateOrThrow = (schema, payload) => {

    const result = schema.safeParse(payload);

    if (!result.success) {
        throw new ValidationError(result.error.issues);
    }

    return result.data;

};