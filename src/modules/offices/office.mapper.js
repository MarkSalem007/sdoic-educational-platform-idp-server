export const mapOffice = (office) => ({
    id: office.id,
    officeName: office.officeName,
    officeType: office.officeType,
    schoolLevel: office.schoolLevel ?? null,
    officeCode: office.officeCode,
    officeHead: office.officeHead,
    officeAddress: office.officeAddress,
    officeEmail: office.officeEmail,
    officeContact: office.officeContact,
    createdAt: office.createdAt,
    updatedAt: office.updatedAt
});


export const mapOffices = (offices) =>
    offices.map(mapOffice);