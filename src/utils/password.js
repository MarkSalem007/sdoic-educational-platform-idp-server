import bcrypt from 'bcrypt';
import env from '../config/env.js';

export const hashPassword = async (password) => {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};