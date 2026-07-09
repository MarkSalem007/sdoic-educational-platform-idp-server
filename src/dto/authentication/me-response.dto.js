export const mapMeResponse = ({ session, user }) => ({
    sessionId: session.id,
    user: {
        id: user.id,
        email: user.email,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
        firstName: user.profile.firstName,
        middleName: user.profile.middleName,
        lastName: user.profile.lastName
    }
});