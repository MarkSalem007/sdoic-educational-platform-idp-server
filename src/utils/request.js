import UAParser from 'ua-parser-js';

export const getClientInfo = (req) => {

    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();

    return {
        ipAddress:
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket.remoteAddress ||
            null,
        browser: result.browser.name,
        browserVersion: result.browser.version,
        operatingSystem: result.os.name,
        operatingSystemVersion: result.os.version,
        deviceName: result.device.model || result.device.type || 'Desktop',
        userAgent: req.headers['user-agent'] || null
    };
};