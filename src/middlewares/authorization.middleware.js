import { AuthorizationError } from '../errors/index.js';

export const requireAuthentication = (req, res, next) => {
    if (!req.authentication) {
        throw new AuthorizationError('AUTH_FORBIDDEN','Authentication required.');
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