import env from '../../config/env.js';

export const mapInstitution = (institution) => ({
    id: institution.id,
    code: institution.code,
    name: institution.name,
    shortName: institution.shortName,

    logoUrl: institution.logoUrl
        ? `${env.APP_URL}/uploads/institution-logos/${institution.logoUrl}`
        : null,

    addressLine1: institution.addressLine1,
    addressLine2: institution.addressLine2,
    city: institution.city,
    province: institution.province,
    region: institution.region,

    contactNumber: institution.contactNumber,
    email: institution.email,

    headerLine1: institution.headerLine1,
    headerLine2: institution.headerLine2,
    headerLine3: institution.headerLine3,

    footerLine1: institution.footerLine1,
    footerLine2: institution.footerLine2,

    isActive: institution.isActive,

    createdAt: institution.createdAt,
    updatedAt: institution.updatedAt
});

export const mapInstitutions = (institutions) =>
    institutions.map(mapInstitution);
