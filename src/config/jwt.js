import env from './env.js';

export default {

    access: {
        secret: env.JWT_ACCESS_SECRET,
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
        issuer: env.ACCESS_TOKEN_ISSUER
    },
    refresh: {
        secret: env.JWT_REFRESH_SECRET,
        expiresIn: env.JWT_REFRESH_EXPIRES_IN
    }
}