import { ValidationError, AuthorizationError } from "../errors/index.js";
import { userStatus } from "@prisma/client";
import { z } from 'zod';

export const mobileNumber = z.preprocess(
        (value) => {
            if (value === undefined || value === null) { return null; }
            if (typeof value !== 'string') { return value; }

            const trimmed = value.trim();
            return trimmed === '' ? null : trimmed;
        },
        z.string().regex( /^09\d{9}$/,'Invalid Philippine mobile number.' ).nullable().optional()
);


export const updateUserSchema = z.object({

    firstName: z
        .string()
        .trim()
        .min(1)
        .optional(),

    middleName: z
        .string()
        .trim()
        .nullable()
        .optional(),

    lastName: z
        .string()
        .trim()
        .min(1)
        .optional(),

    suffix: z
        .string()
        .trim()
        .nullable()
        .optional(),

    mobileNumber:
        mobileNumber.optional(),

    avatar: z
        .string()
        .trim()
        .nullable()
        .optional(),

    status: z
        .nativeEnum(userStatus)
        .optional(),

    mustChangePassword: z
        .boolean()
        .optional()

}).strict();

export const ensureUserCanBeUpdated = (user) => {
    if (!user) {
        throw new ValidationError('USER_NOT_FOUND','User not found.');
    }
};

export const ensureProfileExists = (profile) => {
    if (!profile) {
        throw new ValidationError('PROFILE_NOT_FOUND', 'user profile not found.')
    }
};

export const ensureMobileNumberIsAvailable = ({existingProfile,userId}) => {
    if (existingProfile && existingProfile.userId !== userId) {
        throw new ValidationError('MOBILE_NUMBER_ALREADY_EXISTS', 'The mobile number is already in use.');
    }
};

export const ensureStatusTransitionIsValid = ({ currentStatus, newStatus }) => {
    if (!newStatus || currentStatus === newStatus) {
        return;
    }

    switch (currentStatus) {
        case userStatus.TERMINATED:
            throw new AuthorizationError('INVALID_STATUS_TRANSITION','A terminated account cannot be modified.');
        default:
            return;
    }
};