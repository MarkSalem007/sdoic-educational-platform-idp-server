import AppError from './app-errors.js';

export default class NotFoundError extends AppError {
    constructor(
        code = 'RESOURCE_NOT_FOUND',
        message = 'Requested resource was not found.',
        errors = null
    ) {
        super({
            statusCode: 404,
            code,
            message,
            errors
        });
    }
}