import express from 'express';
import * as controller from './office.controllers.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';

const router = express.Router();

router.post('/', authenticationMiddleware, controller.createOffice);
router.get('/', authenticationMiddleware, controller.getOffices);
router.get('/:officeId', authenticationMiddleware, controller.getOffice);
router.patch('/:officeId', authenticationMiddleware, controller.updateOffice);
router.delete('/:officeId', authenticationMiddleware, controller.deleteOffice);

export default router;