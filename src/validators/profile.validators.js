import { NotFoundError } from '../errors/index.js';

export const ensureProfileExists = (profile) => {
    if (!profile) {
        throw new NotFoundError(
            'PROFILE_NOT_FOUND',
            'Profile not found.'
        );
    }
};

export const ensureAvatarExists = (file) => {
    if (!file) {
        throw new ValidationError(
            'AVATAR_REQUIRED',
            'Avatar image is required.'
        );
    }
};

export const ensureAvatarExtensionAllowed = (extension) => {
    const allowed = [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp'
    ];
    if (!allowed.includes(extension)) {
        throw new ValidationError(
            'INVALID_AVATAR',
            'Only JPG, JPEG, PNG and WEBP images are allowed.'
        );
    }
};