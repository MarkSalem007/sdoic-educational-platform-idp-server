import express from 'express';
import * as controller from './institution.controllers.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';
import { requirePermission, requireAnyPermission } from '../../middlewares/authorization.middleware.js';
import uploadMiddleware from '../../middlewares/upload.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = express.Router();

router.post('/', authenticationMiddleware, requirePermission(PERMISSIONS.CREATE_INSTITUTIONS), controller.createInstitution);
router.get('/', authenticationMiddleware, controller.getInstitutions);
router.get('/:institutionId', authenticationMiddleware, controller.getInstitution);
router.patch('/:institutionId', authenticationMiddleware, requirePermission(PERMISSIONS.UPDATE_INSTITUTION), controller.updateInstitution);
router.delete('/:institutionId', authenticationMiddleware, requirePermission(PERMISSIONS.DELETE_INSTITUTION), controller.deleteInstitution);
router.post('/:institutionId/logo', authenticationMiddleware, requirePermission(PERMISSIONS.UPDATE_INSTITUTION), uploadMiddleware.single('logo'), controller.uploadLogo);

export default router;
