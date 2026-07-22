import { Router } from 'express';
import * as applicationController from './application.controllers.js';
import asyncHandler from '../../utils/async-handler.js';
import { createApplicationSchema, updateApplicationSchema, applicationIdSchema } from '../../validators/application.validators.js';
import { validateRequest } from '../../utils/validators.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js'
import upload from '../../middlewares/upload.middleware.js';

const router = Router();

router.get('/', authenticationMiddleware, asyncHandler(applicationController.getApplications));
router.get('/:id', authenticationMiddleware, validateRequest({ params: applicationIdSchema }), asyncHandler(applicationController.getApplication));
router.post('/', authenticationMiddleware, upload.single('logo'), validateRequest({ body: createApplicationSchema }), asyncHandler(applicationController.createApplication));
router.patch('/:id', authenticationMiddleware, upload.single('logo'), validateRequest({ params: applicationIdSchema, body: updateApplicationSchema }), asyncHandler(applicationController.updateApplication));
router.delete('/:id', authenticationMiddleware, validateRequest({ params: applicationIdSchema }), asyncHandler(applicationController.deleteApplication));

export default router;