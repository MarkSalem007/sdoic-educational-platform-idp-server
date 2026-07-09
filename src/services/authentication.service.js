import * as authenticationRepository from '../modules/authentication/authentication.repository.js';
import { verifyAccessToken } from '../utils/index.js';
import { ensureUserExists, ensureAccountIsActive, ensureAccountIsNotLocked, ensureSessionExists, ensureSessionIsActive, ensurePasswordVersionMatches } from '../validators/index.js';

export const authenticate = async ({ accessToken }) => {

    // Verify JWT signature
    const payload = verifyAccessToken(accessToken);

    // Find session together with user
    const session =
        await authenticationRepository.findSessionWithUser({
            sessionId: payload.sid
        });

    ensureSessionExists(session);
    ensureSessionIsActive(session);
    const user = session.user;
    ensureUserExists(user);
    ensureAccountIsActive(user);
    ensureAccountIsNotLocked(user);
    ensurePasswordVersionMatches({ tokenPasswordVersion: payload.pwdv, userPasswordVersion: user.passwordVersion });

    await authenticationRepository.updateLastActivity({
        sessionId: session.id,
        lastActivity: new Date()
    });

    return Object.freeze({
        token: payload,
        session,
        user
    });
};
