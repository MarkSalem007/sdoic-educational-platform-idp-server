export const extractPermissions = (user) => {
    const isSystemAdmin = user.roleAssignments?.some(ra => ra.role.code === 'SYSTEM_ADMIN' || ra.role.name === 'System Administrator');
    if (isSystemAdmin) {
        return ['ALL_PERMISSIONS'];
    }

    const rolePermissions = user.roleAssignments?.flatMap(ra => ra.role.permissions?.map(rp => rp.permission.code) || []) || [];
    const userGranted = user.userPermissions?.filter(up => up.effect === 'GRANT').map(up => up.permission.code) || [];
    const userDenied = user.userPermissions?.filter(up => up.effect === 'DENY').map(up => up.permission.code) || [];

    const permissionsSet = new Set([...rolePermissions, ...userGranted]);
    userDenied.forEach(code => permissionsSet.delete(code));
    
    return Array.from(permissionsSet);
};

export const extractRoles = (user) => {
    return user.roleAssignments?.map(ra => ra.role.code) || [];
};
