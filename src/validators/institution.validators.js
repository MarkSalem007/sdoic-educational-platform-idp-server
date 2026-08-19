import { NotFoundError, ConflictError, ValidationError } from '../errors/index.js';

export const ensureInstitutionExists = (institution) => {
    if (!institution) {
        throw new NotFoundError(
            'INSTITUTION_NOT_FOUND',
            'Institution not found.'
        );
    }
};

export const ensureInstitutionCodeAvailable = (institution) => {
    if (institution) {
        throw new ConflictError(
            'INSTITUTION_CODE_EXISTS',
            'Institution code already exists.'
        );
    }
};

export const ensureLogoExists = (file) => {
    if (!file) {
        throw new ValidationError(
            'LOGO_REQUIRED',
            'Logo image is required.'
        );
    }
};

export const ensureLogoExtensionAllowed = (extension) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowed.includes(extension)) {
        throw new ValidationError(
            'INVALID_LOGO',
            'Only JPG, JPEG, PNG and WEBP images are allowed.'
        );
    }
};
