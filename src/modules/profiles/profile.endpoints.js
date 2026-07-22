import express from 'express';
import authenticate from '../../middlewares/authenticate.middleware.js';
import uploadMiddleware from '../../middlewares/upload.middleware.js';
import * as controller from './profile.controllers.js';

const router = express.Router();

router.get('/', authenticate, controller.getProfile);
router.put('/', authenticate, controller.updateProfile);
router.post('/avatar', authenticate, uploadMiddleware.single('avatar'), controller.uploadAvatar);

export default router;