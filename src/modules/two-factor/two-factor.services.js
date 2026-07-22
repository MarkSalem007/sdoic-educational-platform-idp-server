import * as twoFactorRepository from './two-factor.repository.js';
import { ensurePasswordMatches } from '../../validators/index.js';
import { AuthenticationError } from '../../errors/index.js';
import * as auditService from '../../services/audit.service.js';
import * as passwordService from '../../services/password.service.js';
import { auditAction } from '@prisma/client';
import {
    generateSecret,
    generateQRCode,
    encryptSecret,
    generateBackupCodes,
    hashBackupCode,
    verifyCode,
    decryptSecret
} from '../../utils/two-factor.js';
import { withTransaction } from '../../utils/index.js';

export const setup = async ({ authentication }) => {

    const user = authentication.user;

    const secret = generateSecret(user.email);

    const encryptedSecret =
        encryptSecret(secret.base32);

    const qrCode =
        await generateQRCode(secret.otpauth_url);

    const backupCodes =
        generateBackupCodes();

    return withTransaction(async (tx) => {

        const existing =
            await twoFactorRepository.findByUserId({
                tx,
                userId: user.id
            });

        if (existing) {

            await twoFactorRepository.deleteBackupCodes({
                tx,
                twoFactorId: existing.id
            });

            await twoFactorRepository.remove({
                tx,
                userId: user.id
            });

        }

        const twoFactor =
            await twoFactorRepository.create({
                tx,
                data: {
                    userId: user.id,
                    twoFactorSecretEncrypted: encryptedSecret,
                    twoFactorEnabled: false
                }
            });

        await twoFactorRepository.createBackupCodes({
            tx,
            codes: backupCodes.map(code => ({
                twoFactorId: twoFactor.id,
                codeHash: hashBackupCode(code)
            }))
        });

        return {
            qrCode,
            backupCodes
        };

    });

};

export const verifySetUp = async ({authentication, token }) => {

    const user = authentication.user;
    const twoFactor = await twoFactorRepository.findByUserId({
        userId: user.id
    });

    if (!twoFactor) {
        throw new Error(
            'Two Factor Authentication has not been initialized.'
        );
    }

    const secret = decryptSecret(twoFactor.twoFactorSecretEncrypted);
    const result = verifyCode({ secret, token });

    if (!result.valid) {
        throw new Error(
            'Invalid authentication code.'
        );
    }

    if (twoFactor.lastTotpCounter !== null && result.counter <= twoFactor.lastTotpCounter) {
        throw new Error(
            'This authentication code has already been used.'
        );
    }

    await twoFactorRepository.update({
        userId: user.id,
        data: {
            twoFactorEnabled: true,
            verifiedAt: new Date(),
            failedAttempts: 0,
            lockedUntil: null,
            lastTotpCounter: result.counter
        }
    });

    return {
        enabled: true
    };
};

export const disable = async ({authentication, password, token, context }) => {

    const user = authentication.user;

    console.log({
        password,
        user,
        passwordHash: user.passwordHash
    });


    const passwordMatches = await passwordService.compare(password, user.passwordHash);

    ensurePasswordMatches(passwordMatches);

    const twoFactor = await twoFactorRepository.findByUserId({
        userId: user.id
    });

    if (!twoFactor || !twoFactor.twoFactorEnabled) {
        throw new AuthenticationError(
            'TWO_FACTOR_NOT_ENABLED',
            'Two-factor authentication is not enabled.'
        );
    }

    if ( twoFactor.lockedUntil && twoFactor.lockedUntil > new Date() ) {
        throw new AuthenticationError(
            'TWO_FACTOR_LOCKED',
            'Two-factor authentication is temporarily locked.'
        );
    }

    const secret = decryptSecret(twoFactor.twoFactorSecretEncrypted);
    const result = verifyCode({ secret, token });

    if (!result.valid) {

        const attempts = twoFactor.failedAttempts + 1;

        await twoFactorRepository.incrementFailedAttempts({
            userId: user.id,
            failedAttempts: attempts,
            lockedUntil:
                attempts >= 5
                    ? new Date(Date.now() + 5 * 60 * 1000)
                    : null
        });

        throw new AuthenticationError(
            'INVALID_TWO_FACTOR_CODE',
            'Invalid authentication code.'
        );
    }

    if ( twoFactor.lastTotpCounter !== null && result.counter <= twoFactor.lastTotpCounter ) {
        throw new AuthenticationError(
            'TWO_FACTOR_CODE_ALREADY_USED',
            'This authentication code has already been used.'
        );
    }

    return withTransaction(async (tx) => {

        await twoFactorRepository.deleteChallenges({
            tx,
            userId: user.id
        });

        await twoFactorRepository.remove({
            tx,
            userId: user.id
        });

        await auditService.create({
            tx,
            context,
            userId: user.id,
            sessionId: authentication.session.id,
            action: auditAction.DISABLE_TWO_FACTOR,
            description: 'User disabled two-factor authentication.'
        });

        return {
            disabled: true
        };
    });
};
