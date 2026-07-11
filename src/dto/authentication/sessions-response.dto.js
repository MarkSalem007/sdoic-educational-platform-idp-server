export const mapSessionResponse = ({
    session,
    currentSessionId
}) => {

    return {
        id: session.id,
        deviceName: session.deviceName,
        browser: session.browser,
        operatingSystem: session.operatingSystem,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        current: session.id === currentSessionId
    };

};

export const mapSessionsResponse = ({
    sessions,
    currentSessionId
}) => {

    return sessions.map(session =>
        mapSessionResponse({
            session,
            currentSessionId
        })
    );

};