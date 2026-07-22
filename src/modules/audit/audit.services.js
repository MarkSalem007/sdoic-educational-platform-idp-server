import * as repository from './audit.repository.js';
import { mapAuditLogs } from './audit.mapper.js';

export const getMyAuditLogs = async ({
    authentication,
    page = 1,
    limit = 10
}) => {

    const skip = (page - 1) * limit;

    const where = {
        userId: authentication.user.id
    };

    const [auditLogs, total] = await Promise.all([

        repository.findMany({
            where,
            skip,
            take: limit
        }),

        repository.count({
            where
        })
    ]);


    return {
        auditLogs: mapAuditLogs(auditLogs),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const create = async ({
    tx,
    context,
    userId = null,
    sessionId = null,
    action,
    description,
    metadata = null
}) => {

    return repository.create({
        tx,
        data: {
            requestId: context?.requestId ?? null,
            userId,
            sessionId,
            ipAddress: context?.ipAddress ?? null,
            userAgent: context?.userAgent ?? null,
            action,
            description,
            metadata
        }
    });

}