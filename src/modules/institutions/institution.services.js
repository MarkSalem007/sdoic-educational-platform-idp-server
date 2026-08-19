import * as repository from './institution.repository.js';
import { mapInstitution, mapInstitutions } from './institution.mapper.js';
import {
    ensureInstitutionExists,
    ensureInstitutionCodeAvailable,
    ensureLogoExists,
    ensureLogoExtensionAllowed
} from '../../validators/institution.validators.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import env from '../../config/env.js';

export const createInstitution = async ({ tx, data }) => {

    const existing = await repository.findByCode({ tx, code: data.code });
    ensureInstitutionCodeAvailable(existing);

    const institution = await repository.create({ tx, data });

    return mapInstitution(institution);
};

export const getInstitution = async ({ institutionId }) => {

    const institution = await repository.findById({ institutionId });
    ensureInstitutionExists(institution);

    return mapInstitution(institution);
};

export const getInstitutions = async ({ page = 1, limit = 10, search, isActive }) => {

    const skip = (page - 1) * limit;
    const where = {};

    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { code: { contains: search } },
            { shortName: { contains: search } }
        ];
    }

    const [institutions, total] = await Promise.all([
        repository.findMany({ where, skip, take: limit }),
        repository.count({ where })
    ]);

    return {
        institutions: mapInstitutions(institutions),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const updateInstitution = async ({ tx, institutionId, data }) => {

    const institution = await repository.findById({ tx, institutionId });
    ensureInstitutionExists(institution);

    // If code is being changed, ensure it's not taken by another record
    if (data.code && data.code !== institution.code) {
        const existing = await repository.findByCode({ tx, code: data.code });
        ensureInstitutionCodeAvailable(existing);
    }

    const updated = await repository.update({ tx, institutionId, data });

    return mapInstitution(updated);
};

export const deleteInstitution = async ({ institutionId }) => {

    const institution = await repository.findById({ institutionId });
    ensureInstitutionExists(institution);

    await repository.remove({ institutionId });
};

export const uploadLogo = async ({ tx, institutionId, file }) => {

    const institution = await repository.findById({ tx, institutionId });
    ensureInstitutionExists(institution);

    ensureLogoExists(file);

    const extension = path.extname(file.originalname).toLowerCase();
    ensureLogoExtensionAllowed(extension);

    await fs.mkdir(env.INSTITUTION_LOGO_STORAGE, { recursive: true });

    // Delete old logo file if it exists
    if (institution.logoUrl) {
        const oldFile = path.join(env.INSTITUTION_LOGO_STORAGE, institution.logoUrl);
        try {
            await fs.unlink(oldFile);
        } catch {
            // Ignore — file may already be gone
        }
    }

    const filename = `${institutionId}${extension}`;
    const destination = path.join(env.INSTITUTION_LOGO_STORAGE, filename);

    await fs.writeFile(destination, file.buffer);

    const updated = await repository.updateLogo({ tx, institutionId, logoUrl: filename });

    return mapInstitution(updated);
};
