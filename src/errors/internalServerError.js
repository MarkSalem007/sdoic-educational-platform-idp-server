import AppError from './app-errors.js';

export default class InternalServerError extends AppError {
    constructor(
        message = 'Internal server error.'
    ) {
        super({
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message
        });
    }
}