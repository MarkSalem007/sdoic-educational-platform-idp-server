import env from '../config/env.js';
import { durationToMilliseconds } from './duration.js';

const isProduction = env.NODE_ENV === 'production';
const accessTokenMaxAge = durationToMilliseconds(env.JWT_ACCESS_EXPIRES_IN);
const refreshTokenMaxAge = durationToMilliseconds(env.JWT_REFRESH_EXPIRES_IN);

const cookieDomain = env.COOKIE_DOMAIN || (isProduction ? '.depedimuscity.com' : undefined);

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
};

export const setAccessTokenCookie = (res, token) => {
    res.cookie(
        'accessToken',
        token,
        {
            ...cookieOptions,
            maxAge: accessTokenMaxAge,
        }
    );
};

export const setRefreshTokenCookie = (res, token) => {
    res.cookie(
        'refreshToken',
        token,
        {
            ...cookieOptions,
            maxAge: refreshTokenMaxAge,
        }
    );
};

export const clearAuthCookies = (res) => {
    res.clearCookie(
        'accessToken',
        cookieOptions
    );

    res.clearCookie(
        'refreshToken',
        cookieOptions
    );
};