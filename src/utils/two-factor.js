import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import env from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';

const ENCRYPTION_KEY = crypto
    .createHash('sha256')
    .update(env.TWO_FACTOR_SECRET_KEY)
    .digest();

export const generateSecret = (email) => {
    return speakeasy.generateSecret({
        name: `${env.APP_NAME}:${email}`,
        issuer: env.APP_NAME,
        length: 32
    });
};

export const generateQRCode = async (otpauthUrl) => {
    return QRCode.toDataURL(otpauthUrl, {
        errorCorrectionLevel: 'H',
        margin: 2
    });
};

export const encryptSecret = (secret) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        ENCRYPTION_KEY,
        iv
    );
    let encrypted = cipher.update(
        secret,
        'utf8',
        'hex'
    );
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return [
        iv.toString('hex'),
        authTag.toString('hex'),
        encrypted
    ].join(':');
};

export const decryptSecret = (encryptedSecret) => {
    const [ ivHex, authTagHex, encrypted ] = encryptedSecret.split(':');

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        ENCRYPTION_KEY,
        Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(
        Buffer.from(authTagHex, 'hex')
    );

    let decrypted = decipher.update(
        encrypted,
        'hex',
        'utf8'
    );

    decrypted += decipher.final('utf8');

    return decrypted;
};

export const verifyCode = ({ secret, token }) => {
    const delta = speakeasy.totp.verifyDelta({
        secret,
        encoding: 'base32',
        token,
        window: 1
    });

    if (!delta) return { valid: false, counter: null };

    const counter = Math.floor(Date.now() / 1000 / 30) + delta.delta;

    return { valid: true, counter };
};

export const generateBackupCodes = (count = 10) => {
    return Array.from({ length: count }, () =>
        crypto
            .randomBytes(5)
            .toString('hex')
            .toUpperCase()
    );
};

export const hashBackupCode = (code) => {
    return crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');
};

export const verifyBackupCode = ({ code, hash }) => {
    return hashBackupCode(code) === hash;
};

