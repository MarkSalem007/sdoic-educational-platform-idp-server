import crypto from 'crypto';

export const generateRandomToken = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString('hex');
};

export const hashToken = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};

export const generateIdempotencyKey = () => {
    return crypto.randomUUID();
};

export const generateJti = () => {
    return crypto.randomUUID();
};