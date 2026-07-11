import crypto from 'crypto';
import env from '../config/env.js';
import * as authenticationRepository from '../modules/authentication/authentication.repository.js';
import { durationToDate } from '../utils/index.js';

export const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export const hash = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};

export const create = async ({
    tx,
    userId
}) => {

    await authenticationRepository.revokePasswordResetTokens({
        tx,
        userId
    });

    const token = generateToken();

    await authenticationRepository.createPasswordResetToken({
        tx,
        data: {
            userId,
            tokenHash: hash(token),
            expiresAt: durationToDate(
                env.PASSWORD_RESET_TOKEN_EXPIRES_IN
            )
        }
    });

    return token;
};

export const find = async ({
    token
}) => {

    return authenticationRepository.findPasswordResetToken({
        tokenHash: hash(token)
    });

};