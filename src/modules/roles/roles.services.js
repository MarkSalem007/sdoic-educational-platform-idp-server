import * as rolesRepository from './roles.repository.js';
import { withTransaction } from '../../utils/transaction.js';
import { ConflictError, NotFoundError } from '../../errors/index.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';

export const createRole = async ({ data, context }) => {
    const existingCode = await rolesRepository.findByCode({ code: data.code });
    if (existingCode) {
        throw new ConflictError('Role code already exists.');
    }

    return withTransaction(async (tx) => {
        const createdRole = await rolesRepository.createRole({
            tx,
            data: {
                name: data.name,
                code: data.code,
                description: data.description
            }
        });

        // Here we could add an audit log later
        return createdRole;
    });
};

export const updateRole = async ({ roleId, data, context }) => {
    return withTransaction(async (tx) => {
        const role = await rolesRepository.findById({ tx, roleId });
        if (!role) {
            throw new NotFoundError('Role not found.');
        }

        if (data.code && data.code !== role.code) {
            const existingCode = await rolesRepository.findByCode({ tx, code: data.code });
            if (existingCode) {
                throw new ConflictError('Role code already exists.');
            }
        }

        const updatedRole = await rolesRepository.updateRole({
            tx,
            roleId,
            data: {
                name: data.name,
                code: data.code,
                description: data.description
            }
        });

        return updatedRole;
    });
};

export const getById = async ({ roleId }) => {
    const role = await rolesRepository.findById({ roleId });
    if (!role) {
        throw new NotFoundError('Role not found.');
    }
    return role;
};

export const getAll = async ({ query }) => {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 50;
    const search = query.search || '';

    const { skip, take } = getPagination({ page, pageSize });
    
    const [roles, totalRecords] = await Promise.all([
        rolesRepository.findAll({ skip, take, search }),
        rolesRepository.count({ search })
    ]);

    return {
        roles,
        meta: buildPaginationMeta({ page, pageSize, totalRecords })
    };
};

export const deleteRole = async ({ roleId, context }) => {
    return withTransaction(async (tx) => {
        const role = await rolesRepository.findById({ tx, roleId });
        if (!role) {
            throw new NotFoundError('Role not found.');
        }
        
        // Ensure no one is currently assigned to this role before deleting
        // Prisma will probably throw a foreign key constraint error otherwise
        
        await rolesRepository.deleteRole({ tx, roleId });
        return { success: true };
    });
};

export const assignRole = async ({ userId, roleId, assignedBy, context }) => {
    return withTransaction(async (tx) => {
        const role = await rolesRepository.findById({ tx, roleId });
        if (!role) throw new NotFoundError('Role not found.');

        try {
            await rolesRepository.assignRoleToUser({
                tx,
                data: {
                    userId,
                    roleId,
                    assignedBy
                }
            });
        } catch (e) {
            // Unique constraint violation (already assigned) is okay to ignore or throw conflict
            throw new ConflictError('Role is already assigned to this user.');
        }

        return { success: true };
    });
};

export const revokeRole = async ({ userId, roleId, context }) => {
    return withTransaction(async (tx) => {
        try {
            await rolesRepository.removeRoleFromUser({ tx, userId, roleId });
        } catch (e) {
             throw new NotFoundError('Role assignment not found.');
        }
        return { success: true };
    });
};

export const getUserRoles = async ({ userId }) => {
    const assignments = await rolesRepository.getUserRoles({ userId });
    return assignments.map(a => a.role);
};
