export const successResponse = ({
    message = 'Success',
    data = null,
    meta = null,
    requestId = null,
    timestamp = new Date().toISOString()
} = {}) => {

    return {
        success: true,
        message,
        data,
        meta,
        requestId,
        timestamp
    };

};

export const errorResponse = ({
    code,
    message,
    errors = null,
    requestId = null,
    timestamp = new Date().toISOString()
} = {}) => {

    return {
        success: false,
        code,
        message,
        errors,
        requestId,
        timestamp
    };

};