import { ValidationError } from '../errors/index.js';

const parseUrl = (url, label) => {

    try {
        return new URL(url);
    } catch {
        throw new ValidationError(
            'INVALID_APPLICATION_URL',
            `${label} is not a valid URL.`
        );
    }

};

export const validateApplicationUrls = ({
    type = 'INTERNAL',
    baseUrl,
    loginUrl,
    callbackUrl,
    allowedDomains = [],
    production = false
}) => {

    if (!baseUrl) {
        throw new ValidationError(
            'INVALID_APPLICATION_URL',
            'Base URL is required.'
        );
    }

    const base = parseUrl(baseUrl, 'Base URL');

    /**
     * External applications
     *
     * Only validate the main URL.
     */
    if (type === 'EXTERNAL') {
        return;
    }

    const compare = (url, label) => {

        if (!url) {
            return;
        }

        const target = parseUrl(url, label);

        if (target.protocol !== base.protocol) {
            throw new ValidationError(
                'INVALID_APPLICATION_URL',
                `${label} must use the same protocol as the Base URL.`
            );
        }

        if (target.hostname !== base.hostname) {
            throw new ValidationError(
                'INVALID_APPLICATION_URL',
                `${label} must belong to the same hostname as the Base URL.`
            );
        }

        if (target.port !== base.port) {
            throw new ValidationError(
                'INVALID_APPLICATION_URL',
                `${label} must use the same port as the Base URL.`
            );
        }

    };

    compare(loginUrl, 'Login URL');
    compare(callbackUrl, 'Callback URL');

    if (production && callbackUrl) {

        const callback = parseUrl(
            callbackUrl,
            'Callback URL'
        );

        const allowed = allowedDomains.some(domain =>
            callback.hostname === domain ||
            callback.hostname.endsWith(`.${domain}`)
        );

        if (!allowed) {
            throw new ValidationError(
                'INVALID_CALLBACK_DOMAIN',
                'Callback URL is not within an allowed domain.'
            );
        }

    }

};