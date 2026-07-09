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

    if (data.mobileNumber) {
        const existingMobile = await usersRepository.findByMobileNumber({mobileNumber: data.mobileNumber});
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
                    mobileNumber: data.mobileNumber
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
        if (data.mobileNumber) {
            const existingProfile = await usersRepository.findByMobileNumber({ tx,mobileNumber: data.mobileNumber });
            ensureMobileNumberIsAvailable({ existingProfile, userId });
        }

        //validate status transition
        ensureStatusTransitionIsValid({ currentStatus: user.status,newStatus: data.status });

        //prepare user update
        const userData = {};

        if (data.status !== undefined) {userData.status = data.status;}
        if (data.mustChangePassword !== undefined) {userData.mustChangePassword = data.mustChangePassword;}

        //prepare profile data
        const profileData = {};

        if (data.firstName !== undefined) {profileData.firstName = data.firstName;}
        if (data.middleName !== undefined) {profileData.middleName = data.middleName;}
        if (data.lastName !== undefined) {profileData.lastName = data.lastName;}
        if (data.suffix !== undefined) {profileData.suffix = data.suffix;}
        if (data.mobileNumber !== undefined) {profileData.mobileNumber = data.mobileNumber;}
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