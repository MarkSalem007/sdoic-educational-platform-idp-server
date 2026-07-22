import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import env from '../config/env.js';


authenticator.options = {
    window: 1
}

const issuer = env.APP_NAME || 'Identity Provider';

export const generateSecret = (email) => {

    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
        email,
        issuer,
        secret
    );

    return {
        secret,
        otpauthUrl
    };
};

export const generateQRCode = async (otpauthURL) => {
    return await QRCode.toDataURL(otpauthURL);
};

export const verifyCode = ({ secret, token }) => {
    return authenticator.verify({
        token,
        secret
    });
};


export const generateBackupCodes = (count = 10) => {
    return Array.from({ length: count }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
    );
};