export default class AppError extends Error {
    constructor({
        statusCode = 500,
        code = 'INTERNAL_SERVER_ERROR',
        message = 'An unexpected error occurred.',
        errors = null
    } = {}) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);

    }
}