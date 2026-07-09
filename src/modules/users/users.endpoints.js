import { Router } from 'express';
import * as usersController from './users.controllers.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';
import { requireAuthentication } from '../../middlewares/authorization.middleware.js';

const router = Router();

router.post('/', usersController.createUser);
router.patch("/:id",authenticationMiddleware,requireAuthentication,usersController.update);
router.get("/:id",authenticationMiddleware,requireAuthentication,usersController.getById);
router.get('/', authenticationMiddleware, requireAuthentication, usersController.getAll);

export default router;