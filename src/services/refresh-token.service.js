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

export const find = ({ token }) => {
    return authenticationRepository.findActiveRefreshToken({tokenHash: hashToken(token)});
};

export const revoke = ({ tx, refreshTokenId }) => {
    return authenticationRepository.revokeRefreshToken({ tx, refreshTokenId });
};