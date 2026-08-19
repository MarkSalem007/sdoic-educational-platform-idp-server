import env from '../../config/env.js';

export const mapLoginResponse = ({ accessToken = null, refreshToken = null, expiresIn = null, session, user }) => {
    const rolePermissions = user.roleAssignments?.flatMap(ra => ra.role.permissions?.map(rp => rp.permission.code) || []) || [];
    const userGranted = user.userPermissions?.filter(up => up.effect === 'GRANT').map(up => up.permission.code) || [];
    const userDenied = user.userPermissions?.filter(up => up.effect === 'DENY').map(up => up.permission.code) || [];

    const permissionsSet = new Set([...rolePermissions, ...userGranted]);
    userDenied.forEach(code => permissionsSet.delete(code));
    const permissions = Array.from(permissionsSet);

    return {    
        accessToken,
        refreshToken,
        expiresIn,
        sessionId: session.id,
        user: {
            id: user.id,
            email: user.email,
            status: user.status,
            mustChangePassword: user.mustChangePassword,
            firstName: user.profile.firstName,
            middleName: user.profile.middleName,
            lastName: user.profile.lastName,
            avatar: user.profile.avatar ? `${env.APP_URL}/uploads/profile/${user.profile.avatar}` : null,
            twoFactorEnabled: user.userTwoFactor?.twoFactorEnabled ?? false,
            roles: user.roleAssignments?.map(ra => ra.role.code) || [],
            permissions
        }
    };
};