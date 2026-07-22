import * as authenticationService from './authentication.services.js';
import * as sessionService from '../session/session.services.js';
import { validateLogin } from '../../dto/authentication/login.dto.js';
import { asyncHandler, successResponse, toISOString } from '../../utils/index.js';
import { AuthenticationError } from '../../errors/index.js';
import { validateChangePassword } from '../../dto/authentication/change-password.dto.js';
import { validateForgotPassword } from '../../dto/authentication/forgot-password.dto.js';
import { validateResetPassword } from '../../dto/authentication/reset-password.dto.js';
import { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies } from '../../utils/cookies.js';
import { validateVerifyTwoFactor } from '../../dto/two-factor/verify-two-factor.dto.js';
import env from '../../config/env.js';

export const login = asyncHandler(async (req, res) => {

    const data = validateLogin(req.body);
    const result = await authenticationService.login({ data, context: req.context });

    if (result.requiresTwoFactor) {
        return res.status(200).json(
            successResponse({
                message: 'Two-factor authentication required.',
                data: {
                    requiresTwoFactor: true,
                    challenge: result.challenge
                },
                requestId: req.requestId,
                timestamp: toISOString()
            })
        );
    }

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(200).json(
        successResponse({
            message: 'Login successful.',
            data: {
                expiresIn: result.expiresIn,
                sessionId: result.sessionId,
                user: result.user
            },
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const me = asyncHandler(async (req, res) => {
    const data = await authenticationService.me({ authentication: req.authentication });

    res.json(
        successResponse({
            message: 'Authenticated User retrieved successfully',
            data,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const refresh = asyncHandler(async (req, res) => {
    try {

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new AuthenticationError(
                'REFRESH_TOKEN_REQUIRED',
                'Refresh token cookie is required.'
            );
        }

        const result = await authenticationService.refresh({
            refreshToken
        });

        setAccessTokenCookie(res, result.accessToken);

        console.log({
            accessTokenExists: !!result.accessToken,
            refreshTokenExists: !!result.refreshToken,
            refreshLength: result.refreshToken?.length
        });

        setRefreshTokenCookie(res, result.refreshToken);

        console.log("Refresh cookie set.");

        return res.status(200).json(
            successResponse({
                message: 'Token refreshed successfully.',
                data: {
                    expiresIn: result.expiresIn
                },
                requestId: req.requestId,
                timestamp: toISOString()
            })
        );

    } catch (error) {

        // Ensure stale cookies are removed
        if (
            error.code === 'AUTH_REFRESH_TOKEN_REVOKED' ||
            error.code === 'AUTH_REFRESH_TOKEN_EXPIRED'
        ) {
            clearAuthCookies(res);

            console.log({
                code: error.code,
                message: error.message
            });
        }
        throw error;
    }
});

export const logout = asyncHandler(async (req, res) => {

    await authenticationService.logout({
        authentication: req.authentication,
        context: req.context
    });

    clearAuthCookies(res);

    return res.status(200).json(
        successResponse({
            message: 'Logout successful.',
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );

});

export const logoutAll = asyncHandler(async (req, res) => {

    await authenticationService.logoutAll({
        authentication: req.authentication,
        context: req.context
    });

    clearAuthCookies(res);

    return res.status(200).json(
        successResponse({
            message: 'Logged out from all devices.',
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const changePassword = asyncHandler(async (req, res) => {

    const data = validateChangePassword(req.body);

    await authenticationService.changePassword({
        authentication: req.authentication,
        data,
        context: req.context
    });

    return res.status(200).json(
        successResponse({
            message: 'Password changed successfully.',
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const forgotPassword = asyncHandler(async (req, res) => {

    const data = validateForgotPassword(req.body);

    const result = await authenticationService.forgotPassword({
        data,
        context: req.context
    });

    return res.status(200).json(
        successResponse({
            message: 'If the account exists, a password reset link has been sent.',
            data: env.NODE_ENV === 'development' ? result : null,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const resetPassword = asyncHandler(async (req, res) => {

    const data = validateResetPassword(req.body);

    await authenticationService.resetPassword({
        data,
        context: req.context
    });

    return res.status(200).json(
        successResponse({
            message: 'Password has been reset successfully.',
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const getSessions = asyncHandler(async (req, res) => {

    const sessions =
        await sessionService.getUserSessions({
            authentication: req.authentication
        });

    return res.status(200).json(
        successResponse({
            message: 'Sessions retrieved successfully.',
            data: sessions,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const revokeSession = asyncHandler(async (req, res) => {

    await authenticationService.revokeSession({

        sessionId: req.params.sessionId,

        authentication: req.authentication,

        context: req.context

    });

    return res.status(200).json(

        successResponse({

            message: 'Session revoked successfully.',

            requestId: req.requestId,

            timestamp: toISOString()

        })

    );

});

export const getTokenStatus = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AuthenticationError(
            'REFRESH_TOKEN_REQUIRED',
            'Refresh token cookie is required.'
        );
    }

    const data = await authenticationService.getTokenStatus({
            authentication: req.authentication,
            refreshToken
        });

    return res.status(200).json(
        successResponse({
            message: 'Token status retrieved successfully.',
            data,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const verifyTwoFactor = asyncHandler(async (req, res) => {

    const data = validateVerifyTwoFactor(req.body);

    const result = await authenticationService.verifyTwoFactor({ data, context: req.context });

    setAccessTokenCookie(res, result.accessToken);

    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(200).json(
        successResponse({
            message: 'Login Successful.',
            data: {
                expiresIn: result.expiresIn,
                sessionId: result.sessionId,
                user: result.user
            },
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});