import * as authenticationRepository from '../modules/authentication/authentication.repository.js';
import { hashToken, durationToDate } from '../utils/index.js';
import env from '../config/env.js';

export const create = async ({tx, sessionId, refreshToken }) => {
    return authenticationRepository.createRefreshToken({
        tx,
        data: {
            sessionId,
            tokenHash: hashToken(refreshToken),
            expiresAt: durationToDate(env.JWT_REFRESH_EXPIRES_IN)
        }
    });
};

export const find = async ({ tx, refreshToken }) => {
    return authenticationRepository.findRefreshTokenWithSession({
        tx,
        tokenHash: hashToken(refreshToken)
    });
};

export const rotate = async ({
    tx,
    refreshTokenId,
    refreshToken
}) => {

    return authenticationRepository.revokeRefreshToken({
        tx,
        refreshTokenId,
        tokenHash: hashToken(refreshToken),
        expiresAt: durationToDate(
            env.JWT_REFRESH_EXPIRES_IN
        )
    });
};

export const revokeBySession = ({
    tx,
    sessionId
}) => {
    return authenticationRepository.revokeRefreshTokenBySessionId({
        tx,
        sessionId
    });
};