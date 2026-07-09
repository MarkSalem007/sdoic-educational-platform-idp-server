import express from 'express';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js'
import * as authenticationController from './authentication.controllers.js';

const router = express.Router();

router.post('/login', authenticationController.login);
router.get('/me', authenticationMiddleware, authenticationController.me);

export default router;