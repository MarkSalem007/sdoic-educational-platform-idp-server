import AppError from './app-errors.js';

export default class ConflictError extends AppError {
    constructor(
        code = 'RESOURCE_CONFLICT',
        message = 'Resource already exists.',
        errors = null
    ) {
        super({
            statusCode: 409,
            code,
            message,
            errors
        });
    }
}