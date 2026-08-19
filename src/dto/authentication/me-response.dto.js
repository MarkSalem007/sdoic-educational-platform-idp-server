import env from '../../config/env.js';
import { extractPermissions } from '../../utils/index.js';

export const mapMeResponse = ({ session, user }) => {
    const permissions = extractPermissions(user);

    return {
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