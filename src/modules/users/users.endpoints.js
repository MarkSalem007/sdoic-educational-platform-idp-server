import { Router } from 'express';
import * as usersController from './users.controllers.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';
import { requireAuthentication, requirePermission, requireAnyPermission } from '../../middlewares/authorization.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.post('/', authenticationMiddleware, requireAuthentication, requirePermission(PERMISSIONS.CREATE_USER), usersController.createUser);
router.post('/bulk-import', authenticationMiddleware, requireAuthentication, requirePermission(PERMISSIONS.CREATE_USER), usersController.bulkImport);
router.post('/export-credentials', authenticationMiddleware, requireAuthentication, requirePermission(PERMISSIONS.VIEW_ONLY_USERS), usersController.exportCredentials);
router.patch("/:id",authenticationMiddleware,requireAuthentication, requirePermission(PERMISSIONS.UPDATE_USER), usersController.update);
router.get("/:id", authenticationMiddleware, requireAuthentication, usersController.getById);
router.get('/', authenticationMiddleware, requireAuthentication, usersController.getAll);

export default router;