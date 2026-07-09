import AppError from './app-errors.js';

export default class AuthorizationError extends AppError {
    constructor(
        code = 'AUTH_FORBIDDEN',
        message = 'You do not have permission.',
        errors = null
    ) {
        super({
            statusCode: 403,
            code,
            message,
            errors
        });
    }
}