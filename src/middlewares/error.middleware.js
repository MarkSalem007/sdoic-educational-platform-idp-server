import logger from '../config/logger.js';
import env from '../config/env.js';
import { errorResponse, toISOString } from '../utils/index.js';
import { AppError } from '../errors/index.js';
import { ZodError } from 'zod';


export default (err, req, res, next) => {
    logger.error({
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ipAddress: req.context?.ipAddress,
        error: {
            name: err.name,
            code: err.code,
            message: err.message,
            stack: err.stack
        }
    });

    if (err instanceof ZodError){
        return res.status(400).json(
            errorResponse({
                code: 'VALIDATION_ERROR',
                message: 'Validation Failed',
                errors: err.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                })),
                requestId: req.requestId,
                timestamp: toISOString()
            })
        );
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json(
            errorResponse({
                code: err.code,
                message: err.message,
                errors: err.errors,
                requestId: req.requestId,
                timestamp: toISOString()
            })
        );
    }

    return res.status(500).json(
        errorResponse({
            code: 'INTERNAL_SERVER_ERROR',
            message: env.NODE_ENV === 'production'
                ? 'Internal server error.'
                : err.message,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
};