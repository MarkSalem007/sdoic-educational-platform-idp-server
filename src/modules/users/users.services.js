import prisma from '../../config/prisma.js';
import { userStatus, auditAction } from '@prisma/client';
import * as usersRepository from './users.repository.js';
import * as passwordService from '../../services/password.service.js';
import * as auditService from '../../services/audit.service.js';
import * as sessionService from '../session/session.services.js';
import { withTransaction } from '../../utils/transaction.js';
import { ConflictError } from '../../errors/index.js';
import { mapUserResponse } from '../../dto/users/user-response.dto.js';
import { ensureProfileExists,ensureMobileNumberIsAvailable,ensureStatusTransitionIsValid, ensureUserCanBeUpdated } from '../../validators/user.validators.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { parseGetUsersQuery } from '../../dto/users/get-users.dto.js';
import { mapUsersListResponse } from '../../dto/users/users-list-response.dto.js';

export const createUser = async ({ data, context }) => {

    const existingEmail = await usersRepository.findByEmail({ email: data.email });

    if (existingEmail) {
        throw new ConflictError('Email address already exists.');
    }

    const trimmedMobile = data.mobileNumber && typeof data.mobileNumber === 'string' && data.mobileNumber.trim() !== '' ? data.mobileNumber.trim() : null;

    if (trimmedMobile) {
        const existingMobile = await usersRepository.findByMobileNumber({ mobileNumber: trimmedMobile });
        if (existingMobile) {
            throw new ConflictError('Mobile number already exists.');
        }
    }

    const temporaryPassword = passwordService.generateTemporaryPassword();
    const passwordHash = await passwordService.hash(temporaryPassword);

    const user = await withTransaction(async (tx) => {
        const createdUser = await usersRepository.createUser({
                tx,
                data: {
                    email: data.email,
                    passwordHash,
                    passwordVersion: 1,
                    status: userStatus.ACTIVE,
                    mustChangePassword: true
                }
            });

            await usersRepository.createProfile({
                tx,
                data: {
                    userId: createdUser.id,
                    firstName: data.firstName,
                    middleName: data.middleName,
                    lastName: data.lastName,
                    suffix: data.suffix,
                    mobileNumber: trimmedMobile
                }
            });

            await auditService.create({
                tx,
                context,
                userId: createdUser.id,
                action: auditAction.REGISTER,
                description: 'Administrator created user account.'
            });
            return createdUser;
        });

    return {
        userId: user.id,
        email: user.email,
        temporaryPassword
    };
};

export const update = async ({ userId, data, context }) => {
    return withTransaction(async (tx) => {
        const user = await usersRepository.findById({ tx, userId });
        
        ensureUserCanBeUpdated(user);
        ensureProfileExists(user.profile);
        
        //validate mobile number
        const trimmedMobile = data.mobileNumber !== undefined ? (data.mobileNumber && typeof data.mobileNumber === 'string' && data.mobileNumber.trim() !== '' ? data.mobileNumber.trim() : null) : undefined;

        if (trimmedMobile) {
            const existingProfile = await usersRepository.findByMobileNumber({ tx, mobileNumber: trimmedMobile });
            ensureMobileNumberIsAvailable({ existingProfile, userId });
        }

        //validate status transition
        ensureStatusTransitionIsValid({ currentStatus: user.status, newStatus: data.status });

        //prepare user update
        const userData = {};

        if (data.status !== undefined) { userData.status = data.status; }
        if (data.mustChangePassword !== undefined) { userData.mustChangePassword = data.mustChangePassword; }

        //prepare profile data
        const profileData = {};

        if (data.firstName !== undefined) { profileData.firstName = data.firstName; }
        if (data.middleName !== undefined) { profileData.middleName = data.middleName; }
        if (data.lastName !== undefined) { profileData.lastName = data.lastName; }
        if (data.suffix !== undefined) { profileData.suffix = data.suffix; }
        if (trimmedMobile !== undefined) { profileData.mobileNumber = trimmedMobile; }
        if (data.avatar !== undefined) { profileData.avatar = data.avatar; }


        //Update Tables
        if (Object.keys(userData).length) {
            await usersRepository.updateUser({ tx, userId, data: userData });
        }

        if (Object.keys(profileData).length) {
            await usersRepository.updateProfile({ tx, userId, data: profileData });
        }

        //Revoke Sessions
        if ( data.status === userStatus.DISABLED || data.status === userStatus.TERMINATED || data.status === userStatus.SUSPENDED ) {
            console.log('Updating user:', userId);
            await sessionService.revokeAllUserAccess ({ tx, userId });
        }

        //Audit

        const description = data.status && data.status !== user.status
            ? `User status changed from ${user.status} to ${data.status}`
            : 'User profile updated.'

        await auditService.create({
            tx,
            context,
            userId,
            action: auditAction.UPDATE_USER,
            description
        });


        //Updated User
        const updatedUser = await usersRepository.findById({ tx, userId });

        return mapUserResponse({ user: updatedUser });
    });
};

export const getById = async ({userId}) => {
    const user = await usersRepository.findById({ userId });
    ensureUserCanBeUpdated(user);
    ensureProfileExists(user.profile);
    return mapUserResponse({ user });
};

export const getAll = async ({ query }) => {
    const { page, pageSize, search, status, sortBy, sortOrder } = parseGetUsersQuery(query);

    console.log({
        page,
        pageSize,
        search,
        status,
        sortBy,
        sortOrder
    });

    const { skip, take } = getPagination({ page, pageSize });
    const [users, totalRecords] = await Promise.all([usersRepository.findAll({ skip, take, search, status, sortBy, sortOrder }), usersRepository.count({
        search,
        status
    })]);

    console.log({
        skip,
        take
    });

    return {
        users: mapUsersListResponse({ users }),
        meta: buildPaginationMeta({ page, pageSize, totalRecords})
    };
};

export const bulkImport = async ({ users, context }) => {
    // 1. Get Teacher Role (assuming code 'TEACHER' or name 'Teacher')
    // We'll search by name 'Teacher' if code doesn't exist.
    const allRoles = await prisma.role.findMany();
    const teacherRole = allRoles.find(r => r.code === 'TEACHER' || r.name.toLowerCase() === 'teacher');
    const teacherRoleId = teacherRole ? teacherRole.id : null;

    const importedUsers = [];
    const errors = [];

    for (const userData of users) {
        try {
            // Check if email already exists
            const existingEmail = await usersRepository.findByEmail({ email: userData.email });
            if (existingEmail) {
                errors.push({ email: userData.email, error: 'Email already exists.' });
                continue;
            }

            const temporaryPassword = passwordService.generateTemporaryPassword();
            const passwordHash = await passwordService.hash(temporaryPassword);

            const user = await withTransaction(async (tx) => {
                const createdUser = await usersRepository.createUser({
                    tx,
                    data: {
                        email: userData.email,
                        passwordHash,
                        passwordVersion: 1,
                        status: userStatus.ACTIVE,
                        mustChangePassword: true
                    }
                });

                await usersRepository.createProfile({
                    tx,
                    data: {
                        userId: createdUser.id,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                    }
                });

                if (teacherRoleId) {
                    await tx.roleAssignment.create({
                        data: {
                            userId: createdUser.id,
                            roleId: teacherRoleId,
                            assignedBy: context?.userId
                        }
                    });
                }

                await auditService.create({
                    tx,
                    context,
                    userId: createdUser.id,
                    action: auditAction.CREATE_USER,
                    description: 'Administrator bulk imported user account.'
                });
                return createdUser;
            });
            importedUsers.push(user);
        } catch (error) {
            errors.push({ email: userData.email, error: error.message });
        }
    }

    return { importedCount: importedUsers.length, errors };
};

export const exportCredentials = async ({ roleId, context }) => {
    // 1. Fetch users. If roleId is provided, filter by role.
    const where = {};
    if (roleId && roleId !== 'all') {
        where.roleAssignments = {
            some: { roleId }
        };
    }
    
    const users = await prisma.user.findMany({
        where,
        include: { profile: true }
    });

    const exportedData = [];

    for (const user of users) {
        let temporaryPassword = '';
        
        // Only generate new password if they haven't changed their default one yet
        if (user.mustChangePassword) {
            temporaryPassword = passwordService.generateTemporaryPassword();
            const passwordHash = await passwordService.hash(temporaryPassword);
            
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash }
            });
            
            // Audit log the password regeneration
            await auditService.create({
                context,
                userId: user.id,
                action: auditAction.UPDATE_USER,
                description: 'System generated new temporary password for export.'
            });
        }

        exportedData.push({
            email: user.email,
            firstName: user.profile?.firstName || '',
            lastName: user.profile?.lastName || '',
            status: user.status,
            temporaryPassword
        });
    }

    return exportedData;
};