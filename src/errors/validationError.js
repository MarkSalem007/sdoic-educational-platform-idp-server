import AppError from './app-errors.js';

export default class ValidationError extends AppError {
    constructor(
        errors,
        message = 'Validation failed.'
    ) {
        super({
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message,
            errors: ValidationError.normalize(errors)
        });
    }

    static normalize(issues = []){
        return issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
    };
};