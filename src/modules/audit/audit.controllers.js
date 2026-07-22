import * as auditLogService from './audit.services.js';
import { asyncHandler, successResponse, toISOString } from '../../utils/index.js';
import { validateGetAuditLogs } from '../../dto/audit/get-audit-logs.dto.js';

export const getMyAuditLogs = asyncHandler(async (req, res) => {

    const { page, limit } = validateGetAuditLogs(req.query);

    const data = await auditLogService.getMyAuditLogs({
        authentication: req.authentication,
        page,
        limit
    });

    return res.status(200).json(
        successResponse({
            message: 'Audit logs retrieved successfully.',
            data: data.auditLogs,
            meta: data.meta,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});