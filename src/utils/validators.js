import { ValidationError } from '../errors/index.js';

export const validate = (schema, payload) => {
    const result = schema.safeParse(payload);
    if (!result.success) {
        return {
            success: false,
            errors: result.error.issues
        };
    }
    return {
        success: true,
        data: result.data
    };
};

export const validateRequest = ({ body, params, query }) => {

    return (req, res, next) => {
        if (body) {
            const result = validate(body, req.body);
            if (!result.success) {
                return next(
                    new ValidationError(
                        'VALIDATION_ERROR',
                        result.errors
                    )
                );
            }
            req.body = result.data;
        }

        if (params) {
            const result = validate(params, req.params);
            if (!result.success) {
                return next(
                    new ValidationError(
                        'VALIDATION_ERROR',
                        result.errors
                    )
                );
            }
            req.params = result.data;
        }

        if (query) {
            const result = validate(query, req.query);
            if (!result.success) {
                return next(
                    new ValidationError(
                        'VALIDATION_ERROR',
                        result.errors
                    )
                );
            }
            req.query = result.data;
        }
        next();
    };
};