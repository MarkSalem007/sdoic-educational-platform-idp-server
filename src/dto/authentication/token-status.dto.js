import env from '../../config/env.js'

export const mapTokenStatus = (status) => ({

    serverTime: status.serverTime,

    accessToken: {
        issuedAt: status.accessToken.issuedAt,
        expiresAt: status.accessToken.expiresAt,
        expiresIn: status.accessToken.expiresIn,
        lifetime: status.accessToken.lifetime,
        autoRefresh: Boolean(env.JWT_REFRESH_EXPIRES_IN)
    },

    refreshToken: {
        issuedAt: status.refreshToken.issuedAt,
        expiresAt: status.refreshToken.expiresAt,
        expiresIn: status.refreshToken.expiresIn,
        lifetime: status.refreshToken.lifetime
    },

    session: {
        sessionId: status.session.id,
        deviceName: status.session.deviceName,
        browserName: status.session.browser,
        operatingSystemName: status.session.operatingSystem,
        ipAddress: status.session.ipAddress,
        userAgent: status.session.userAgent,
        startedAt: status.session.startedAt,
        expiresAt: status.session.expiresAt,
        expiresIn: status.session.expiresIn,
        lifetime: status.session.lifetime,
        lastActivity: status.session.lastActivity,
        idleSeconds: status.session.idleSeconds,
        status: status.session.status
    }
});