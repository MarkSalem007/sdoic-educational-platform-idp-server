import AppError from './app-errors.js';

export default class ValidationError extends AppError {
    constructor(
        fieldOrIssues,
        message = 'Validation failed.'
    ) {

        let errors = [];

        if (Array.isArray(fieldOrIssues)){
            errors = ValidationError.normalize(fieldOrIssues)
        } else {
            errors = [
                {
                    field: fieldOrIssues,
                    message
                }
            ];
            message = 'Validation failed.';
        }
        
        super({
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message,
            errors
        });
    }

    static normalize(issues = []){
        return issues.map(issue => ({
            field:issue.field ??
            (Array.isArray(issue.path) ? issue.path.join('.') : ''),
            message: issue.message,
        }));
    };
};