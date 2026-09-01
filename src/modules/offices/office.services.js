import * as repository from "./office.repository.js";
import { mapOffice, mapOffices } from "./office.mapper.js";
import { ensureOfficeCodeAvailable, ensureOfficeExists } from "../../validators/office.validators.js";

export const createOffice = async ({ tx, data }) => {
    const sanitizedData = { ...data };
    if (sanitizedData.officeCode) {
        sanitizedData.officeCode = sanitizedData.officeCode.trim();
        if (sanitizedData.officeCode === '') {
            sanitizedData.officeCode = null;
        }
    }
    if (sanitizedData.officeEmail) {
        sanitizedData.officeEmail = sanitizedData.officeEmail.trim();
        if (sanitizedData.officeEmail === '') {
            sanitizedData.officeEmail = null;
        }
    }

    if (sanitizedData.officeCode) {
        const existingOffice = await repository.findByOfficeCode({
            tx,
            officeCode: sanitizedData.officeCode
        });

        ensureOfficeCodeAvailable(existingOffice);
    }

    const office = await repository.create({ tx, data: sanitizedData });

    return mapOffice(office);
};

export const getOffice = async ({ officeId }) => {
    const office = await repository.findById({ officeId });

    ensureOfficeExists(office);

    return mapOffice(office);
};

export const getOffices = async ({ page = 1, limit = 10, search, officeType, schoolLevel }) => {

    const where = {};

    if (officeType) {
        where.officeType = officeType;
    }

    if (schoolLevel) {
        where.schoolLevel = schoolLevel;
    }

    if (search) {
        where.OR = [
            { officeName: { contains: search } },
            { officeCode: { contains: search } }
        ];
    }

    const fetchAll = limit === 0;

    const [offices, total] = await Promise.all([
        repository.findMany({
            where,
            ...(fetchAll ? {} : { skip: (page - 1) * limit, take: limit })
        }),
        repository.count({ where })
    ]);

    return {
        offices: mapOffices(offices),
        pagination: fetchAll
            ? { page: 1, limit: total, total, totalPages: 1 }
            : { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

export const updateOffice = async ({ tx, officeId, data }) => {

    const office = await repository.findById({ tx, officeId });

    ensureOfficeExists(office);

    const sanitizedData = { ...data };
    if (sanitizedData.officeCode !== undefined) {
        sanitizedData.officeCode = sanitizedData.officeCode && sanitizedData.officeCode.trim() !== '' ? sanitizedData.officeCode.trim() : null;
    }
    if (sanitizedData.officeEmail !== undefined) {
        sanitizedData.officeEmail = sanitizedData.officeEmail && sanitizedData.officeEmail.trim() !== '' ? sanitizedData.officeEmail.trim() : null;
    }

    if (sanitizedData.officeCode && sanitizedData.officeCode !== office.officeCode) {
        const existingOffice = await repository.findByOfficeCode({
            tx,
            officeCode: sanitizedData.officeCode
        });

        ensureOfficeCodeAvailable(existingOffice);
    }

    const updatedOffice = await repository.update({
        tx,
        officeId,
        data: sanitizedData
    });

    return mapOffice(updatedOffice);
};

export const deleteOffice = async ({ tx, officeId }) => {

    const office = await repository.findById({ tx, officeId });

    ensureOfficeExists(office);

    await repository.remove({ tx, officeId });
};

