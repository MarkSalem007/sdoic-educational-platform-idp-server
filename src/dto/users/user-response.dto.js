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
        plantilla: user.profile?.plantilla,
        plantillaStatus: user.profile?.plantillaStatus,
        employeeId: user.profile?.employeeId,
        officeId: user.profile?.officeId,
        office: user.profile?.office ? {
            id: user.profile.office.id,
            officeName: user.profile.office.officeName,
            officeType: user.profile.office.officeType,
            officeCode: user.profile.office.officeCode
        } : null,
        institutionId: user.profile?.institutionId,
        institution: user.profile?.institution ? {
            id: user.profile.institution.id,
            name: user.profile.institution.name
        } : null
    }
})