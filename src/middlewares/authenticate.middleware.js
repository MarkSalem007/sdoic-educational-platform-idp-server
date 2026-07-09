import { AuthenticationError } from '../errors/index.js';
import * as authenticationService from '../services/authentication.service.js';
import asyncHandler from '../utils/async-handler.js';

export default asyncHandler(async (req, res, next) => {

    const authorization = req.get('Authorization');

    if (!authorization) {
        throw new AuthenticationError(
            'AUTH_TOKEN_REQUIRED',
            'Authorization header is required.'
        );
    }

    if (!authorization.startsWith('Bearer ')) {
        throw new AuthenticationError(
            'AUTH_TOKEN_INVALID',
            'Invalid authorization header.'
        );
    }

    const accessToken = authorization.substring(7).trim();

    if (!accessToken) {
        throw new AuthenticationError(
            'AUTH_TOKEN_REQUIRED',
            'Access token is required.'
        );
    }

    const authentication = await authenticationService.authenticate({ accessToken });

    req.authentication = authentication;
    req.user = authentication.user;
    req.session = authentication.session;
    req.token = authentication.token;
    req.context = Object.freeze({
        ...req.context,
        authenticatedUserId: req.user.id
    });
    next();
});