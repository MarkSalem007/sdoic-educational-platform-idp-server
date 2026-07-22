import express from 'express'
import * as controller from './two-factor.controllers.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js'

const router = express.Router();

router.post('/setup', authenticationMiddleware, controller.setup);
router.post('/verify', authenticationMiddleware, controller.verifySetup);
router.post('/disable', authenticationMiddleware, controller.disable);

export default router;
