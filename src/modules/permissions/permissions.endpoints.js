import { Router } from 'express';
import * as permissionsController from './permissions.controllers.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';
import { requireAuthentication, requirePermission, requireAnyPermission } from '../../middlewares/authorization.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticationMiddleware, requireAuthentication);

router.get('/', requireAnyPermission([PERMISSIONS.VIEW_ONLY_PERMISSIONS, PERMISSIONS.CREATE_PERMISSION, PERMISSIONS.UPDATE_PERMISSION, PERMISSIONS.DELETE_PERMISSION]), permissionsController.getAllPermissions);
router.get('/role/:roleId', requireAnyPermission([PERMISSIONS.VIEW_ONLY_PERMISSIONS, PERMISSIONS.VIEW_ONLY_ROLES]), permissionsController.getPermissionsByRole);
router.post('/role/:roleId', requirePermission(PERMISSIONS.UPDATE_ROLE), permissionsController.assignPermissionToRole);
router.delete('/role/:roleId/:permissionId', requirePermission(PERMISSIONS.UPDATE_ROLE), permissionsController.removePermissionFromRole);

router.get('/:id', requireAnyPermission([PERMISSIONS.VIEW_ONLY_PERMISSIONS, PERMISSIONS.CREATE_PERMISSION, PERMISSIONS.UPDATE_PERMISSION, PERMISSIONS.DELETE_PERMISSION]), permissionsController.getById);
router.post('/', requirePermission(PERMISSIONS.CREATE_PERMISSION), permissionsController.create);
router.put('/:id', requirePermission(PERMISSIONS.UPDATE_PERMISSION), permissionsController.update);
router.delete('/:id', requirePermission(PERMISSIONS.DELETE_PERMISSION), permissionsController.remove);

export default router;
