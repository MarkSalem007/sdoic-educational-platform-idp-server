import { z } from 'zod';

const getAuditLogsSchema = z.object({

    page: z.coerce
        .number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)

});

export const validateGetAuditLogs = (query) => {
    return getAuditLogsSchema.parse(query);
};