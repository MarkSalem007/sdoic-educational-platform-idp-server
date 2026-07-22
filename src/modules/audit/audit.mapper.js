export const mapAuditLog = (auditLog) => ({

    id: auditLog.id,

    action: auditLog.action,

    description: auditLog.description,

    createdAt: auditLog.createdAt,

    user: auditLog.user
        ? {
            id: auditLog.user.id,
            email: auditLog.user.email,
            firstName: auditLog.user.profile?.firstName,
            middleName: auditLog.user.profile?.middleName,
            lastName: auditLog.user.profile?.lastName
        }
        : null
});

export const mapAuditLogs = (auditLogs) =>
    auditLogs.map(mapAuditLog);