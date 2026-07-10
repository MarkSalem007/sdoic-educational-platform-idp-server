import { AuthenticationError, AuthorizationError } from '../errors/index.js';

export const requireAuthentication = (req, res, next) => {
    if (!req.authentication) {
        throw new AuthenticationError('AUTH_TOKEN_REQUIRED','Authentication required.');
    }
    next();
};

export const requireSelf = (parameter = 'id') => {
    return (req, res, next) => {
        if (req.user.id !== req.params[parameter]) {
            throw new AuthorizationError('AUTH_FORBIDDEN','You are not allowed to access this resource.');
        }
        next();
    };
};