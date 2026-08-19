import { Router } from 'express';
import * as applicationController from './application.controllers.js';
import asyncHandler from '../../utils/async-handler.js';
import { createApplicationSchema, updateApplicationSchema, applicationIdSchema } from '../../validators/application.validators.js';
import { validateRequest } from '../../utils/validators.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';
import { requirePermission, requireAnyPermission } from '../../middlewares/authorization.middleware.js';
import upload from '../../middlewares/upload.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.get('/', authenticationMiddleware, asyncHandler(applicationController.getApplications));
router.get('/:id', authenticationMiddleware, validateRequest({ params: applicationIdSchema }), asyncHandler(applicationController.getApplication));
router.post('/', authenticationMiddleware, requirePermission(PERMISSIONS.CREATE_APPLICATIONS), upload.single('logo'), validateRequest({ body: createApplicationSchema }), asyncHandler(applicationController.createApplication));
router.patch('/:id', authenticationMiddleware, requirePermission(PERMISSIONS.UPDATE_APPLICATION), upload.single('logo'), validateRequest({ params: applicationIdSchema, body: updateApplicationSchema }), asyncHandler(applicationController.updateApplication));
router.delete('/:id', authenticationMiddleware, requirePermission(PERMISSIONS.DELETE_APPLICATION), validateRequest({ params: applicationIdSchema }), asyncHandler(applicationController.deleteApplication));

export default router;