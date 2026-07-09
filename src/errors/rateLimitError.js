import AppError from './app-errors.js';

export default class RateLimitError extends AppError {
    constructor(
        message = 'Too many requests.'
    ) {
        super({
            statusCode: 429,
            code: 'RATE_LIMIT_EXCEEDED',
            message
        });
    }
}