import { auditAction } from '@prisma/client';
import { ValidationError } from '../../errors/index.js';
import * as authenticationRepository from './authentication.repository.js';
import * as twoFactorRepository from '../two-factor/two-factor.repository.js';
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
import { hashToken, verifyRefreshToken, withTransaction, generateJti, generateAccessToken, generateRefreshToken, extractPermissions } from '../../utils/index.js';
import env from '../../config/env.js';
import { handleLoginFailure, handleLoginSuccess } from './authentication-login.helpers.js';
import { generateChallenge } from '../../utils/two-factor-challenge.js';
import { decryptSecret, verifyCode } from '../../utils/two-factor.js';

const calculateLifetime = (payload) => {
    return payload.exp - payload.iat;
};

const calculateRemaining = (exp) => {
    return Math.max(
        0,
        exp - Math.floor(Date.now() / 1000)
    );
};

const getSessionStatus = (lastActivity) => {
    const idleSeconds = Math.floor(
        (Date.now() - lastActivity.getTime()) / 1000
    );

    let status = 'ACTIVE';

    if (idleSeconds > 1800) {
        status = 'OFFLINE';
    } else if (idleSeconds > 300) {
        status = 'IDLE';
    }

    return {
        idleSeconds,
        status
    };
};

export const login = async ({ data, context }) => {
    const user = await authenticationRepository.findUserByEmail({ email: data.email });
    const application = await authenticationRepository.findApplicationByCode({ code: data.clientId });

    if (!application) {
        throw new ValidationError(
            'APPLICATION_NOT_FOUND',
            'Unknown application.'
        );
    }

if (application.status !== 'ACTIVE') {

    throw new ValidationError(
        'APPLICATION_DISABLED',
        'Application is disabled.'
    );

}

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

    const twoFactor = await twoFactorRepository.findByUserId({ userId: user.id });

    if (twoFactor?.twoFactorEnabled) {
        const challenge = generateChallenge();

        try {
            const created = await authenticationRepository.createChallenge({
                    data: {
                        userId: user.id,
                        applicationId: application.id,
                        challenge,
                        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
                    }
        });

        } catch (err) {
            console.error(err);
            throw err;
        }

        return {
            requiresTwoFactor: true,
            challenge
        };
    }

    return withTransaction(async (tx) => {

        const allApplicationCodes = await authenticationRepository.findAllApplicationCodes({ tx });

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
                jti,
                email: user.email,
                audience: allApplicationCodes,
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                displayName: user.profile.displayName,
                avatar: user.profile.avatar,
                permissions: extractPermissions(user)
            });

        const refreshToken =
            generateRefreshToken({
                sub: user.id,
                sid: session.id,
                pwdv: user.passwordVersion,
                jti,
                email: user.email,
                audience: allApplicationCodes
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

        const allApplicationCodes = await authenticationRepository.findAllApplicationCodes({ tx });

        // Generate fresh JTI
        const newJti = generateJti();

        // Generate new access token
        const accessToken =
            generateAccessToken({
                sub: user.id,
                sid: session.id,
                pwdv: user.passwordVersion,
                jti: newJti,
                email: user.email,
                audience: allApplicationCodes,
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                displayName: user.profile.displayName,
                avatar: user.profile.avatar,
                permissions: extractPermissions(user)
            });

        // Generate new refresh token
        const newRefreshToken =
            generateRefreshToken({
                sub: user.id,
                sid: session.id,
                pwdv: user.passwordVersion,
                jti: newJti,
                audience: allApplicationCodes
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

export const getTokenStatus = async ({ authentication, refreshToken }) => {

    const accessPayload = authentication.token;
    const refreshPayload = verifyRefreshToken(refreshToken);
    const session = authentication.session;
    const sessionLifetime = Math.floor((session.expiresAt.getTime() - session.createdAt.getTime()) / 1000);
    const sessionRemaining = Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
    const sessionHealth = getSessionStatus(session.lastActivity);

    return {
        serverTime:
            new Date(),
        accessToken: {
            issuedAt: new Date(accessPayload.iat * 1000),
            expiresAt: new Date(accessPayload.exp * 1000),
            expiresIn: calculateRemaining(accessPayload.exp),
            lifetime: calculateLifetime(accessPayload),
            autoRefresh: true
        },

        refreshToken: {
            issuedAt: new Date(refreshPayload.iat * 1000),
            expiresAt: new Date(refreshPayload.exp * 1000),
            expiresIn: calculateRemaining(refreshPayload.exp),
            lifetime: calculateLifetime(refreshPayload)
        },

        session: {
            id: session.id,
            deviceName: session.deviceName,
            browserName: session.browser,
            operatingSystemName: session.operatingSystem,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            startedAt: session.createdAt,
            expiresAt: session.expiresAt,
            expiresIn: sessionRemaining,
            lifetime: sessionLifetime,
            lastActivity: session.lastActivity,
            idleSeconds: sessionHealth.idleSeconds,
            status: sessionHealth.status
        }
    };
};

export const verifyTwoFactor = async ({ data, context }) => {

    const loginChallenge =
        await authenticationRepository.findChallenge({
            challenge: data.challenge
        });

    const application = loginChallenge.application;

    if (!application) {
        throw new AuthenticationError(
            'APPLICATION_NOT_FOUND',
            'Application not found.'
        );
    }

    if (!loginChallenge) {
        throw new AuthenticationError(
            'INVALID_CHALLENGE',
            'Login challenge is invalid.'
        );
    }

    if (loginChallenge.completedAt) {
        throw new AuthenticationError(
            'CHALLENGE_ALREADY_USED',
            'Login challenge has already been used.'
        );
    }

    if (loginChallenge.expiresAt < new Date()) {
        throw new AuthenticationError(
            'CHALLENGE_EXPIRED',
            'Login challenge has expired.'
        );
    }

    const user = loginChallenge.user;

    const twoFactor = await twoFactorRepository.findByUserId({userId: user.id});

    if (!twoFactor || !twoFactor.twoFactorEnabled) {
        throw new AuthenticationError(
            'TWO_FACTOR_DISABLED',
            'Two-factor authentication is not enabled.'
        );
    }

    if (
        twoFactor.lockedUntil &&
        twoFactor.lockedUntil > new Date()
    ) {
        throw new AuthenticationError(
            'TWO_FACTOR_LOCKED',
            'Two-factor authentication is temporarily locked.'
        );
    }

    const secret = decryptSecret(twoFactor.twoFactorSecretEncrypted);

    const result = verifyCode({secret, token: data.code});

    if (!result.valid) {

        const attempts = twoFactor.failedAttempts + 1;

        await twoFactorRepository.incrementFailedAttempts({
            userId: user.id,
            failedAttempts: attempts,
            lockedUntil:
                attempts >= 5
                    ? new Date(Date.now() + 5 * 60 * 1000)
                    : null
        });

        throw new AuthenticationError(
            'INVALID_TWO_FACTOR_CODE',
            'Invalid authentication code.'
        );
    }

    if (
        twoFactor.lastTotpCounter !== null &&
        result.counter <= twoFactor.lastTotpCounter
    ) {
        throw new AuthenticationError(
            'TWO_FACTOR_CODE_ALREADY_USED',
            'This authentication code has already been used.'
        );
    }

    return withTransaction(async (tx) => {

        const allApplicationCodes = await authenticationRepository.findAllApplicationCodes({ tx });

        await twoFactorRepository.resetFailedAttempts({
            tx,
            userId: user.id
        });

        await twoFactorRepository.updateLastTotpCounter({
            tx,
            userId: user.id,
            counter: result.counter
        });

        await authenticationRepository.deleteChallenge({
            tx,
            challenge: loginChallenge.challenge
        });

        const jti = generateJti();

        const session =
            await sessionService.createSession({
                tx,
                jti,
                userId: user.id,
                userAgent: context.userAgent,
                ipAddress: context.ipAddress
            });

        const accessToken =
            generateAccessToken({
                sub: user.id,
                sid: session.id,
                pwdv: user.passwordVersion,
                jti,
                email: user.email,
                audience: allApplicationCodes,
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                displayName: user.profile.displayName,
                avatar: user.profile.avatar,
                permissions: extractPermissions(user)
            });

        const refreshToken =
            generateRefreshToken({
                sub: user.id,
                sid: session.id,
                pwdv: user.passwordVersion,
                jti,
                email: user.email,
                audience: allApplicationCodes
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
            description: 'User completed two-factor authentication.'
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