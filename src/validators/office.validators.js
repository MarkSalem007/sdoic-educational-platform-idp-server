import { NotFoundError, ConflictError, ValidationError } from '../errors/index.js';

export const ensureOfficeExists = (office) => {
    if (!office) {
        throw new NotFoundError(
            'OFFICE_NOT_FOUND',
            'Office not found.'
        );
    }
};

export const ensureOfficeCodeAvailable = (office) => {
    if (office) {
        throw new ConflictError(
            'OFFICE_CODE_EXISTS',
            'Office code already exists.'
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
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    if (!allowed.includes(extension)) {
        throw new ValidationError(
            'INVALID_LOGO',
            'Only JPG, JPEG, PNG, WEBP, and SVG images are allowed.'
        );
    }
};