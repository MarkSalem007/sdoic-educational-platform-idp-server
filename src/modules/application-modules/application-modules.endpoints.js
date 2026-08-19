import { Router } from 'express';
import * as controllers from './application-modules.controllers.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';
import { requireAuthentication } from '../../middlewares/authorization.middleware.js';

const router = Router();

router.use(authenticationMiddleware, requireAuthentication);

router.get('/', controllers.getAll);
router.get('/:id', controllers.getById);
router.post('/', controllers.create);
router.put('/:id', controllers.update);
router.delete('/:id', controllers.remove);

export default router;
