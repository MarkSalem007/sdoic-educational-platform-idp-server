import { auditAction } from '@prisma/client';
import * as authenticationRepository from './authentication.repository.js';
import * as passwordService from '../../services/password.service.js';
import * as auditService from '../../services/audit.service.js';
import * as sessionService from '../session/session.services.js';
import * as refreshTokenService from '../../services/refresh-token.service.js';
import { mapLoginResponse } from '../../dto/authentication/login-response.dto.js';
import { mapMeResponse } from '../../dto/authentication/me-response.dto.js';
import { ensureUserExists, ensureAccountIsActive, ensureAccountIsNotLocked, ensurePasswordMatches } from '../../validators/index.js';
import { withTransaction, generateJti, generateAccessToken, generateRefreshToken } from '../../utils/index.js';
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
                ipAddress: context.ipAddress
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