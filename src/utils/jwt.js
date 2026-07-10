import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import jwtConfig from '../config/jwt.js';
import { AuthenticationError } from '../errors/index.js';

export const generateAccessToken = ({sub, sid, pwdv, jti}) => {
    return jwt.sign(
        { sub, sid, pwdv },
        jwtConfig.access.secret,
        {
            expiresIn: jwtConfig.access.expiresIn,
            jwtid: jti
        }
    );
};

export const generateRefreshToken = ({sub, sid, pwdv, jti}) => {
    return jwt.sign(
        { sub, sid, pwdv }, jwtConfig.refresh.secret,{ expiresIn: jwtConfig.refresh.expiresIn, jwtid: jti }
    );
};

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.access.secret);
    } catch (error) {
        switch (error.name) {
            case 'TokenExpiredError':
                throw new AuthenticationError(
                    'AUTH_TOKEN_EXPIRED',
                    'Access token has expired!'
                );
            case 'JsonWebTokenError':
                throw new AuthenticationError(
                    'AUTH_TOKEN_INVALID',
                    'Access token is invalid!'
                );
            case 'NotBeforeError':
                throw new AuthenticationError(
                    'AUTH_TOKEN_NOT_ACTIVE',
                    'Access token is not active yet!'
                );
            default:
                throw new AuthenticationError (
                    'AUTH_TOKEN_INVALID',
                    'Unable to verify access token!'
                )
        } 
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.refresh.secret);
    } catch (error) {
        switch (error.name) {
            case 'TokenExpiredError':
                throw new AuthenticationError(
                    'AUTH_REFRESH_TOKEN_EXPIRED',
                    'Refresh token has expired!'
                );
            case 'JsonWebTokenError':
                throw new AuthenticationError(
                    'AUTH_REFRESH_TOKEN_INVALID',
                    'Refresh token is invalid!'
                );
            case 'NotBeforeError':
                throw new AuthenticationError(
                    'AUTH_REFRESH_TOKEN_NOT_ACTIVE',
                    'Refresh token is not active yet!'
                );
            default:
                throw new AuthenticationError (
                    'AUTH_REFRESH_TOKEN_INVALID',
                    'Unable to verify refresh token!'
                )
        } 
    }
};