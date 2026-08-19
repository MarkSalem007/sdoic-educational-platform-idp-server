import * as repository from './application-modules.repository.js';
import { NotFoundError, ConflictError, ValidationError } from '../../errors/index.js';
import { withTransaction } from '../../utils/index.js';

export const getAll = async () => {
    return await repository.findAll({});
};

export const getById = async (id) => {
    const module = await repository.findById({ id });
    if (!module) throw new NotFoundError('MODULE_NOT_FOUND', 'Application module not found.');
    return module;
};

export const create = async (data) => {
    try {
        return await repository.create({ data });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new ConflictError('MODULE_CODE_EXISTS', 'A module with this code already exists for the application.');
        }
        throw error;
    }
};

export const update = async (id, data) => {
    await getById(id); // ensure exists
    try {
        return await repository.update({ id, data });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new ConflictError('MODULE_CODE_EXISTS', 'A module with this code already exists for the application.');
        }
        throw error;
    }
};

export const remove = async (id) => {
    await getById(id); // ensure exists
    try {
        return await repository.remove({ id });
    } catch (error) {
        if (error.code === 'P2003') {
            throw new ValidationError('MODULE_IN_USE', 'Cannot delete module because it has associated permissions.');
        }
        throw error;
    }
};
