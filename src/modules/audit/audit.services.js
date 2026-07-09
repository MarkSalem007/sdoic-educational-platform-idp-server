import * as auditRepository from '../modules/audit/audit.repository.js';

export const create = async ({ tx, context, userId = null, sessionId = null, action, description = null }) => {
    return auditRepository.create({
        tx,
        data: {
            requestId: context.requestId,
            userId,
            sessionId,
            action,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            description
        }
    });
};