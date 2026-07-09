import app from '../../config/app.js';
import { successResponse, toISOString } from '../../utils/index.js';

export const health = (req, res) => {
    return res.json(
        successResponse({
            message: 'Identity Provider is healthy.',
            data: {
                application: app.name,
                version: app.version,
                status: 'UP'
            },
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
};