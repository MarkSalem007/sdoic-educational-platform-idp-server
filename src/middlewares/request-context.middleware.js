export default (req, res, next) => {
    req.context = Object.freeze({
        requestId: req.requestId,
        ipAddress:
            req.headers['x-forwarded-for']
                ?.split(',')[0]
                ?.trim() ??
            req.socket.remoteAddress,
        userAgent: req.get('user-agent') ?? 'Unknown',
        authenticatedUserId: null
    });
    next();
};