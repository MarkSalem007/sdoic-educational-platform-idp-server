import env from '../../config/env.js';

export const mapLoginResponse = ({ accessToken = null, refreshToken = null, expiresIn = null, session, user }) => ({    
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
        twoFactorEnabled: user.userTwoFactor?.twoFactorEnabled ?? false
    }
});