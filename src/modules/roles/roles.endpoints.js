import { Router } from 'express';
import * as rolesController from './roles.controllers.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';
import { requireAuthentication, requirePermission, requireAnyPermission } from '../../middlewares/authorization.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticationMiddleware, requireAuthentication);

// Role CRUD
router.post('/', requirePermission(PERMISSIONS.CREATE_ROLE), rolesController.createRole);
router.get('/', requireAnyPermission([PERMISSIONS.VIEW_ONLY_ROLES, PERMISSIONS.CREATE_ROLE, PERMISSIONS.UPDATE_ROLE, PERMISSIONS.DELETE_ROLE]), rolesController.getAll);
router.get('/:id', requireAnyPermission([PERMISSIONS.VIEW_ONLY_ROLES, PERMISSIONS.CREATE_ROLE, PERMISSIONS.UPDATE_ROLE, PERMISSIONS.DELETE_ROLE]), rolesController.getById);
router.put('/:id', requirePermission(PERMISSIONS.UPDATE_ROLE), rolesController.updateRole);
router.delete('/:id', requirePermission(PERMISSIONS.DELETE_ROLE), rolesController.deleteRole);

// Role Assignments (Requires UPDATE_ROLE)
router.post('/assign', requirePermission(PERMISSIONS.UPDATE_ROLE), rolesController.assignRole);
router.get('/user/:userId', requireAnyPermission([PERMISSIONS.VIEW_ONLY_ROLES, PERMISSIONS.UPDATE_ROLE]), rolesController.getUserRoles);
router.delete('/user/:userId/:roleId', requirePermission(PERMISSIONS.UPDATE_ROLE), rolesController.revokeRole);

export default router;
