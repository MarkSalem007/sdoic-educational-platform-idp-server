import { auditAction } from '@prisma/client';
import * as authenticationRepository from './authentication.repository.js';
import * as passwordService from '../../services/password.service.js';
import * as auditService from '../../services/audit.service.js';
import * as sessionService from '../session/session.services.js';
import * as refreshTokenService from '../../services/refresh-token.service.js';
import * as passwordResetService from '../../services/password-reset.service.js';
import { mapLoginResponse } from '../../dto/authentication/login-response.dto.js';
import { AuthenticationError } from '../../errors/index.js';
import { mapMeResponse } from '../../dto/authentication/me-response.dto.js';
import {
    ensureRefreshTokenExists,
    ensureRefreshTokenIsActive,
    ensurePasswordVersionMatches,
    ensureSessionExists,
    ensureSessionIsActive,
    ensureUserExists,
    ensureAccountIsActive,
    ensureAccountIsNotLocked,
    ensurePasswordMatches,
    ensureNewPasswordIsDifferent,
    ensurePasswordResetTokenExists,
    ensurePasswordResetTokenIsUnused,
    ensurePasswordResetTokenIsNotExpired,
    ensurePasswordIsDifferent,
    ensureSessionBelongsToUser,
    ensureSessionIsNotCurrent
} from '../../validators/index.js';
import { hashToken, verifyRefreshToken, withTransaction, generateJti, generateAccessToken, generateRefreshToken } from '../../utils/index.js';
import env from '../../config/env.js';
import { handleLoginFailure, handleLoginSuccess } from './authentication-login.helpers.js';

export const login = async ({ data, context }) => {
    const user =
        await authenticationRepository.findUserByEmail({
            email: data.email
        });

    ensureUserExists(user);
    ensureAccountIsActive(user);
    ensureAccountIsNotLocked(user);

    const passwordMatches =
        await passwordService.compare(
            data.password,
            user.passwordHash
        );

    if (!passwordMatches) {
        await withTransaction(async (tx) => {
            await handleLoginFailure({
                tx,
                user,
                context
            });
        });
        ensurePasswordMatches(false);
    }

    return withTransaction(async (tx) => {

        await handleLoginSuccess({
            tx,
            user
        });

        const jti = generateJti();

        const session =
            await sessionService.createSession({
                tx,
                jti,
                userId: user.id,
                userAgent: context.userAgent,
                ipAddress: context.ipAddress,
            });

        const accessToken =
            generateAccessToken({
                sub: user.id,
                sid: session.id,
                pwdv: user.passwordVersion,
                jti
            });

        const refreshToken =
            generateRefreshToken({
                sub: user.id,
                sid: session.id,
                pwdv: user.passwordVersion,
                jti
            });

        await refreshTokenService.create({
            tx,
            sessionId: session.id,
            refreshToken
        });

        await auditService.create({
            tx,
            context,
            userId: user.id,
            sessionId: session.id,
            action: auditAction.LOGIN,
            description: 'User logged in successfully.'
        });

        return mapLoginResponse({
            accessToken,
            refreshToken,
            expiresIn: env.JWT_ACCESS_EXPIRES_IN,
            session,
            user
        });
    });
};

export const me = async ({ authentication }) => {
    return mapMeResponse({
        session: authentication.session,
        user: authentication.user
    });
};

export const refresh = async ({ refreshToken }) => {

    // Verify JWT
    const payload = verifyRefreshToken(refreshToken);

    // Lookup refresh token
    const storedRefreshToken =
    await refreshTokenService.find({
        refreshToken
    });

    ensureRefreshTokenExists(storedRefreshToken);
    ensureRefreshTokenIsActive(storedRefreshToken);

    const session = storedRefreshToken.session;

    ensureSessionExists(session);
    ensureSessionIsActive(session);

    // Prevent replay attacks
    if (session.jti !== payload.jti) {
        throw new AuthenticationError(
            'AUTH_REFRESH_TOKEN_REVOKED',
            'Refresh token has been revoked.'
        );
    }

    const user = session.user;

    ensureUserExists(user);
    ensureAccountIsActive(user);
    ensureAccountIsNotLocked(user);

    ensurePasswordVersionMatches({
        tokenPasswordVersion: payload.pwdv,
        userPasswordVersion: user.passwordVersion
    });

    return withTransaction(async (tx) => {

        // Generate fresh JTI
        const newJti = generateJti();

        // Generate new access token
        const accessToken =
            generateAccessToken({
                sub: user.id,
                sid: session.id,
                pwdv: user.passwordVersion,
                jti: newJti
            });

        // Generate new refresh token
        const newRefreshToken =
            generateRefreshToken({
                sub: user.id,
                sid: session.id,
                pwdv: user.passwordVersion,
                jti: newJti
            });

        // Persist refresh token
        await refreshTokenService.rotate({
            tx,
            refreshTokenId: storedRefreshToken.id,
            refreshToken: newRefreshToken
        });

        // Update session
        const updatedSession =
            await sessionService.update({
                tx,
                sessionId: session.id,
                data: {
                    jti: newJti,
                    lastActivity: new Date()
                }
            });

        return mapLoginResponse({
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: env.JWT_ACCESS_EXPIRES_IN,
            session: updatedSession,
            user
        });

    });

};

export const rotateRefreshToken = async ({
    tx = prisma,
    refreshTokenId,
    tokenHash,
    expiresAt
}) => {
    return tx.userRefreshToken.update({
        where: {
            id: refreshTokenId
        },
        data: {
            tokenHash,
            expiresAt,
            isRevoked: false,
            revokedAt: null
        }
    });
};

export const logout = async ({ authentication, context }) => {

    const { user, session } = authentication;

    return withTransaction(async (tx) => {

        // Revoke current session
        await sessionService.revokeSession({
            tx,
            sessionId: session.id
        });

        // Revoke current refresh token
        await refreshTokenService.revokeBySession({
            tx,
            sessionId: session.id
        });

        // Audit
        await auditService.create({
            tx,
            context,
            userId: user.id,
            sessionId: session.id,
            action: auditAction.LOGOUT,
            description: 'User logged out.'
        });

    });

};

export const logoutAll = async ({ authentication, context }) => {

    const { user } = authentication;

    return withTransaction(async (tx) => {

        await sessionService.revokeAllUserAccess({
            tx,
            userId: user.id
        });

        await auditService.create({
            tx,
            context,
            userId: user.id,
            sessionId: authentication.session.id,
            action: auditAction.LOGOUT,
            description: 'User logged out from all devices.'
        });

    });

};

export const changePassword = async ({ authentication, data, context }) => {

    const user = authentication.user;

    ensureUserExists(user);
    ensureAccountIsActive(user);
    ensureAccountIsNotLocked(user);

    // Verify current password
    const currentPasswordMatches = await passwordService.compare(data.currentPassword, user.passwordHash);
    ensurePasswordMatches(currentPasswordMatches);

    // Ensure new password is different
    const newPasswordMatchesCurrent = await passwordService.compare(data.newPassword, user.passwordHash);
    ensureNewPasswordIsDifferent({ currentPasswordMatches: newPasswordMatchesCurrent });
    const passwordHash = await passwordService.hash(data.newPassword);

    return withTransaction(async (tx) => {

        // Update password
        await authenticationRepository.changePassword({
            tx,
            userId: user.id,
            passwordHash,
        });

        // Revoke every session
        await sessionService.revokeAllUserAccess({
            tx,
            userId: user.id
        });

        // Audit log
        await auditService.create({
            tx,
            context,
            userId: user.id,
            sessionId: authentication.session.id,
            action: auditAction.CHANGE_PASSWORD,
            description: 'User changed password.'
        });
        return null;
    });
};

export const forgotPassword = async ({ data, context }) => {

    // Look up user by email
    const user = await authenticationRepository.findUserByEmail({
        email: data.email
    });

    // Prevent email enumeration. Return success even if account doesn't exist.
    if (!user) return null;

    // Ignore disabled/locked users. Still return success.
    if (user.status !== 'ACTIVE' ||(user.lockedUntil && user.lockedUntil > new Date())) return null;

    return withTransaction(async (tx) => {

        const resetToken =
            await passwordResetService.create({
                tx,
                userId: user.id
            });

        await auditService.create({
            tx,
            context,
            userId: user.id,
            action: auditAction.FORGOT_PASSWORD,
            description: 'Password reset requested.'
        });

        // Only expose the token during development
        if (env.NODE_ENV === 'development') {
            return { resetToken };
        }

        return null;
    });
};

export const resetPassword = async ({ data, context }) => {

    // Hash incoming token
    const tokenHash = hashToken(data.token);

    // Find token
    const passwordResetToken =
        await authenticationRepository.findPasswordResetToken({
            tokenHash
        });

    ensurePasswordResetTokenExists(passwordResetToken);
    ensurePasswordResetTokenIsUnused(passwordResetToken);
    ensurePasswordResetTokenIsNotExpired(passwordResetToken);

    const user = passwordResetToken.user;

    ensureUserExists(user);
    ensureAccountIsActive(user);

    // Prevent using the same password
    const samePassword =
        await passwordService.compare(
            data.password,
            user.passwordHash
        );

    ensurePasswordIsDifferent(samePassword);

    return withTransaction(async (tx) => {

        // Hash new password
        const passwordHash =
            await passwordService.hash(data.password);

        // Update password
        await authenticationRepository.updatePassword({
            tx,
            userId: user.id,
            passwordHash
        });

        // Mark all reset tokens as used
        await authenticationRepository.markAllPasswordResetTokensUsed({
            tx,
            userId: user.id
        });

        // Revoke all sessions
        await sessionService.revokeAllUserAccess({
            tx,
            userId: user.id
        });

        // Audit
        await auditService.create({
            tx,
            context,
            userId: user.id,
            action: auditAction.RESET_PASSWORD,
            description: 'Password reset successfully.'
        });

        return null;

    });

};

export const revokeSession = async ({
    sessionId,
    authentication,
    context
}) => {

    const session =
        await sessionService.getSessionWithUser({
            sessionId
        });

    ensureSessionExists(session);

    ensureSessionBelongsToUser({
        session,
        userId: authentication.user.id
    });

    ensureSessionIsNotCurrent({
        sessionId,
        currentSessionId: authentication.session.id
    });

    return withTransaction(async (tx) => {

        await sessionService.revokeUserSession({
            tx,
            sessionId
        });

        await auditService.create({
            tx,
            context,
            userId: authentication.user.id,
            sessionId,
            action: auditAction.REVOKE_SESSION,
            description: 'User revoked a session.'
        });

        return null;

    });

};