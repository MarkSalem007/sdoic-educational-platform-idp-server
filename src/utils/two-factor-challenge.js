import crypto from 'crypto';

export const generateChallenge = () => {
    return crypto.randomUUID();
};