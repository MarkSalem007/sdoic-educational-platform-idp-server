import { Router } from 'express';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';
import * as controller from './audit.controllers.js';

const router = Router();

router.get('/me', authenticationMiddleware, controller.getMyAuditLogs);

export default router;