import { auditAction } from '@prisma/client';
import env from '../../config/env.js';
import * as authenticationRepository from './authentication.repository.js';
import * as auditService from '../../services/audit.service.js';
import { ensurePasswordMatches } from '../../validators/index.js';

export const handleLoginFailure = async ({ tx, user, context }) => {
    const updatedUser =
        await authenticationRepository.incrementFailedLoginAttempts({
            tx,
            userId: user.id
        });

    await auditService.create({
        tx,
        context,
        userId: user.id,
        action: auditAction.LOGIN,
        description: 'Invalid password attempt.'
    });

    if (
        updatedUser.failedLoginAttempts >=
        env.LOGIN_MAX_FAILED_ATTEMPTS
    ) {

        await authenticationRepository.lockAccount({
            tx,
            userId: user.id,
            lockMinutes: env.LOGIN_LOCK_MINUTES
        });

        await auditService.create({
            tx,
            context,
            userId: user.id,
            action: auditAction.LOGIN,
            description:
                'Account locked due to multiple failed login attempts.'
        });
    }
};

export const handleLoginSuccess = async ({ tx, user }) => {
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
        await authenticationRepository.resetFailedLoginAttempts({ tx, userId: user.id });
    }
};