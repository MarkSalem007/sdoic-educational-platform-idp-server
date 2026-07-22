import express from 'express';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js'
import { requireAuthentication } from '../../middlewares/authorization.middleware.js'
import * as authenticationController from './authentication.controllers.js';

const router = express.Router();


router.post('/login', authenticationController.login);
router.post('/verify-two-factor', authenticationController.verifyTwoFactor);
router.get('/me', authenticationMiddleware, authenticationController.me);
router.get('/sessions', authenticationMiddleware, requireAuthentication, authenticationController.getSessions);
router.delete('/sessions/:sessionId', authenticationMiddleware, requireAuthentication, authenticationController.revokeSession);
router.get('/token-status', authenticationMiddleware, authenticationController.getTokenStatus);
router.post('/refresh', authenticationController.refresh);
router.post('/logout', authenticationMiddleware, requireAuthentication, authenticationController.logout);
router.post('/logout-all', authenticationMiddleware, requireAuthentication, authenticationController.logoutAll);
router.post('/change-password', authenticationMiddleware, requireAuthentication, authenticationController.changePassword);
router.post('/forgot-password', authenticationController.forgotPassword);
router.post('/reset-password', authenticationController.resetPassword);


export default router;