import { NotFoundError, ConflictError } from '../errors/index.js';

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