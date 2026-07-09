import AppError from './app-errors.js';

export default class AuthenticationError extends AppError {
    constructor(
        code = 'AUTH_UNAUTHORIZED',
        message = 'Authentication required.',
        errors = null
    ) {
        super({
            statusCode: 401,
            code,
            message,
            errors
        });
    }
}