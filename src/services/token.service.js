import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
} from '../utils/jwt.js';

import { hashToken } from '../utils/crypto.js';

export const issueTokens = ({ userId, sessionId, passwordVersion }) => {

    const accessToken = generateAccessToken({
        sub: userId,
        sid: sessionId,
        pwdv: passwordVersion
    });

    const refreshToken = generateRefreshToken({
        sub: userId,
        sid: sessionId,
        pwdv: passwordVersion
    });

    return {
        accessToken,
        refreshToken,
        refreshTokenHash: hashToken(refreshToken)
    };

};

export const verifyAccess = (token) => {
    return verifyAccessToken(token);
};

export const verifyRefresh = (token) => {
    return verifyRefreshToken(token);
};

export const hashRefreshToken = (token) => {
    return hashToken(token);
};