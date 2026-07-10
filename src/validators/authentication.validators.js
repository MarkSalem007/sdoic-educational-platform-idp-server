import { AuthenticationError, AuthorizationError, ConflictError } from '../errors/index.js';
import { userStatus } from '@prisma/client';

export const ensureUserExists = (user) => {
    if (!user) {
        throw new AuthenticationError('AUTH_UNAUTHORIZED', 'Invalid email or password');
    }
};

export const ensureAccountIsActive = (user) => {
    switch (user.status) {
        case userStatus.ACTIVE:
            return;
        case userStatus.PENDING:
            throw new AuthorizationError(
                'ACCOUNT_PENDING',
                'Your account is pending activation.'
            );
        case userStatus.DISABLED:
            throw new AuthorizationError(
                'ACCOUNT_DISABLED',
                'Your account has been disabled.'
            );
        case userStatus.SUSPENDED:
            throw new AuthorizationError(
                'ACCOUNT_SUSPENDED',
                'Your account has been suspended.'
            );
        case userStatus.TERMINATED:
            throw new AuthorizationError(
                'ACCOUNT_TERMINATED',
                'Your account has been terminated.'
            );
        default:
            throw new AuthorizationError(
                'AUTH_FORBIDDEN',
                'Account is unavailable.'
            );
    }
};

export const ensureAccountIsNotLocked = (user) => {
    if ( user.lockedUntil && user.lockedUntil > new Date()) {
        throw new AuthorizationError('AUTH_FORBIDDEN', 'Your account is temporarily locked.');
    }
};

export const ensurePasswordMatches = ( isPasswordValid ) => {
    if (!isPasswordValid) {
        throw new AuthenticationError(
            'AUTH_UNAUTHORIZED',
            'Invalid email or password.'
        );
    }
};

export const ensureSessionExists = (session) => {
    if (!session) {
        throw new AuthenticationError(
            'AUTH_INVALID_SESSION',
            'Session not found.'
        );
    }
};

export const ensureSessionIsActive = (session) => {
    if (session.isRevoked) {
        throw new AuthenticationError(
            'AUTH_SESSION_REVOKED',
            'Session has been revoked.'
        );
    }

    if (session.expiresAt <= new Date()) {
        throw new AuthenticationError(
            'AUTH_SESSION_EXPIRED',
            'Session has expired.'
        );
    }
};

export const ensurePasswordVersionMatches = ({
    tokenPasswordVersion,
    userPasswordVersion
}) => {
    if (tokenPasswordVersion !== userPasswordVersion) {
        throw new AuthenticationError(
            'AUTH_TOKEN_INVALID',
            'Token is no longer valid.'
        );
    }
};

export const ensureRefreshTokenExists = (refreshToken) => {
    if (!refreshToken) {
        throw new AuthenticationError(
            'AUTH_UNAUTHORIZED',
            'Invalid refresh token.'
        );
    }
};

export const ensureRefreshTokenIsActive = (refreshToken) => {

    if (refreshToken.isRevoked) {
        throw new AuthenticationError(
            'AUTH_REFRESH_TOKEN_REVOKED',
            'Refresh token has been revoked.'
        );
    }

    if (refreshToken.expiresAt <= new Date()) {
        throw new AuthenticationError(
            'AUTH_REFRESH_TOKEN_EXPIRED',
            'Refresh token has expired.'
        );
    }

};

export const ensureNewPasswordIsDifferent = ({ currentPasswordMatches }) => {
    if (currentPasswordMatches) {
        throw new ConflictError('AUTH_PASSWORD_MISMATCH', 'New password must be different from the current password.');
    }
};