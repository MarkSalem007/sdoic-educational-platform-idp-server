import { UAParser } from 'ua-parser-js';
import env from '../../config/env.js';
import * as repository from './session.repository.js';
import { durationToDate } from '../../utils/index.js';

export const createSession = async ({ tx, jti, userId, userAgent, ipAddress }) => {
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const device = parser.getDevice();
    const operatingSystem = parser.getOS();

    return repository.create({
        tx,
        data: {
            userId,
            jti,
            deviceName: device.model ?? device.type ?? 'Desktop',
            browser: browser.name ? `${browser.name} ${browser.version ?? ''}`.trim() : 'Unknown',
            operatingSystem:
                operatingSystem.name
                    ? `${operatingSystem.name} ${operatingSystem.version ?? ''}`.trim()
                    : 'Unknown',
            userAgent,
            ipAddress,
            lastActivity:
                new Date(),
            expiresAt:
                durationToDate(
                    env.SESSION_EXPIRES_IN
                )
        }
    });
};

export const getSession = async ({ tx, sessionId }) => {
    return repository.findById({ tx, sessionId  });
};

export const getSessionByJti = async ({ tx, jti }) => {
    return repository.findByJti({tx, jti });
};

export const updateActivity = async ({ tx, sessionId }) => {
    return repository.update({ tx, sessionId,
        data: {
            lastActivity: new Date()
        }
    });
};

export const revokeSession = async ({ tx, sessionId }) => {
    return repository.revoke({ tx, sessionId });
};

export const revokeAllSessions = async ({ tx, userId }) => {
    return repository.revokeAllByUser({ tx, userId });
};

export const cleanupExpiredSessions = async ({ tx }) => {
    return repository.deleteExpired({ tx });
};

export const revokeAllUserAccess = async ({ tx, userId }) => {
    console.log('userId received:', userId);
    
    const revokedSessions = await repository.revokeAllByUser({
        tx,
        userId
    });

    console.log('Revoked sessions:', revokedSessions);

    const revokedRefreshTokens = await repository.revokeAllRefreshTokensByUser({
        tx,
        userId
    });

    console.log('Revoked refresh tokens:', revokedRefreshTokens);
};

export const update = async ({ tx, sessionId, data }) => {
    return repository.update({
        tx,
        sessionId,
        data
    });
};