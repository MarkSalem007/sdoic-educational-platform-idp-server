import env from '../../config/env.js'

export const mapProfile = (profile) => ({

    id: profile.id,
    email: profile.user.email,
    firstName: profile.firstName,
    middleName: profile.middleName,
    lastName: profile.lastName,
    suffix: profile.suffix,
    mobileNumber: profile.mobileNumber,
    avatar: profile.avatar ? `${env.APP_URL}/uploads/profile/${profile.avatar}` : null,
    employeeId: profile.employeeId,
    plantilla: profile.plantilla,
    plantillaStatus: profile.plantillaStatus,
    emailVerified: profile.emailVerified,
    lastLogin: profile.lastLogin,
    office: profile.office
        ? {
            id: profile.office.id,
            officeName: profile.office.officeName,
            officeCode: profile.office.officeCode,
            officeType: profile.office.officeType
        }
        : null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
});