export const mapUserResponse = ({ user }) => ({
    id: user.id,
    email: user.email,
    status: user.status,
    profile: {
        firstName: user.profile?.firstName,
        middleName: user.profile?.middleName,
        lastName: user.profile?.lastName,
        suffix: user.profile?.suffix,
        mobileNumber: user.profile?.mobileNumber,
        avatar: user.profile?.avatar,
    }
})