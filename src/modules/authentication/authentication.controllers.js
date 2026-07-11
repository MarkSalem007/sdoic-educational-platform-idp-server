import * as authenticationService from './authentication.services.js';
import * as sessionService from '../session/session.services.js';
import { validateLogin } from '../../dto/authentication/login.dto.js';
import { asyncHandler, successResponse, toISOString } from '../../utils/index.js';
import { validateRefreshToken } from '../../dto/tokens/refresh-token.dto.js';
import { validateChangePassword } from '../../dto/authentication/change-password.dto.js';
import { validateForgotPassword } from '../../dto/authentication/forgot-password.dto.js';
import { validateResetPassword } from '../../dto/authentication/reset-password.dto.js';
import env from '../../config/env.js';

export const login = asyncHandler(async (req, res) => {
    const data = validateLogin(req.body);
    const result = await authenticationService.login({ data, context: req.context });

    return res.status(200).json(
        successResponse({
            message: 'Login successful.',
            data: result,
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

    const { refreshToken } = validateRefreshToken(req.body);

    const result = await authenticationService.refresh({ refreshToken });

    return res.status(200).json(
        successResponse({
            message: 'Token refreshed successfully.',
            data: result,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const logout = asyncHandler(async (req, res) => {

    await authenticationService.logout({
        authentication: req.authentication,
        context: req.context
    });

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