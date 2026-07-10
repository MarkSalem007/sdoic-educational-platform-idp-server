import express from 'express';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js'
import { requireAuthentication } from '../../middlewares/authorization.middleware.js'
import * as authenticationController from './authentication.controllers.js';

const router = express.Router();

router.post('/login', authenticationController.login);
router.get('/me', authenticationMiddleware, authenticationController.me);
router.post('/refresh',authenticationController.refresh);
router.post('/logout', authenticationMiddleware, requireAuthentication, authenticationController.logout);
router.post('/logout-all', authenticationMiddleware, requireAuthentication, authenticationController.logoutAll);
router.post('/change-password', authenticationMiddleware, requireAuthentication, authenticationController.changePassword);

export default router;