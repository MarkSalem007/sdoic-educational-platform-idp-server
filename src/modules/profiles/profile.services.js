import * as repository from './profile.repository.js';
import * as officeRepository from '../offices/office.repository.js';
import { mapProfile } from './profile.mapper.js';
import { ensureProfileExists, ensureAvatarExtensionAllowed, ensureAvatarExists } from '../../validators/profile.validators.js';
import { ensureOfficeExists } from '../../validators/office.validators.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import env from '../../config/env.js';

export const getProfile = async ({ authentication }) => {
    const profile = await repository.findByUserId({
        userId: authentication.user.id
    });

    ensureProfileExists(profile);

    return mapProfile(profile);
};

export const updateProfile = async ({ tx, authentication, data }) => {
    const profile = await repository.findByUserId({
        tx,
        userId: authentication.user.id
    });

    ensureProfileExists(profile);

    // Validate office if provided
    if (data.officeId) {
        const office = await officeRepository.findById({
            tx,
            officeId: data.officeId
        });
        ensureOfficeExists(office);
    }

    const updatedProfile =
        await repository.update({

            tx,

            userId: authentication.user.id,

            data

        });

    return mapProfile(updatedProfile);
};


export const uploadAvatar = async ({ tx, authentication, file }) => {

    const profile = await repository.findByUserId({ tx, userId: authentication.user.id });

    ensureProfileExists(profile);

    ensureAvatarExists(file);

    const extension = path.extname(file.originalname).toLowerCase();

    ensureAvatarExtensionAllowed(extension);

    await fs.mkdir(
        env.STORAGE_LOCATION,
        { recursive: true }
    );

    // Delete previous avatar
    if (profile.avatar) {
        const oldFile =
            path.join(
                env.STORAGE_LOCATION,
                profile.avatar
            );
        try {
            await fs.unlink(oldFile);
        } catch {
            // Ignore missing file
        }
    }

    const filename = `${authentication.user.id}${extension}`;
    const destination = path.join(env.STORAGE_LOCATION, filename);

    await fs.writeFile(destination, file.buffer);

    const updatedProfile = await repository.updateAvatar({tx, userId: authentication.user.id, avatar: filename});

    return mapProfile(updatedProfile);
};