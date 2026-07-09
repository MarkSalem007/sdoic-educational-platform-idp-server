import logger from '../config/logger.js';

export const info = ({
    requestId,
    module,
    action,
    ...context
}) => {
    logger.info({
        requestId,
        module,
        action,
        ...context
    });
};

export const error = ({
    requestId,
    module,
    action,
    error,
    ...context
}) => {
    logger.error({
        requestId,
        module,
        action,
        error: error?.message,
        stack:
            process.env.NODE_ENV === 'development'
                ? error?.stack
                : undefined,
        ...context
    });
};