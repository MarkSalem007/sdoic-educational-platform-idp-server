import express from 'express';
import * as controller from './office.controllers.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';
import uploadMiddleware from '../../middlewares/upload.middleware.js';
import { requireSystemAdmin } from '../../middlewares/authorization.middleware.js';

const router = express.Router();

router.post('/', authenticationMiddleware, requireSystemAdmin, controller.createOffice);
router.get('/', authenticationMiddleware, controller.getOffices);
router.get('/:officeId', authenticationMiddleware, controller.getOffice);
router.patch('/:officeId', authenticationMiddleware, requireSystemAdmin, controller.updateOffice);
router.delete('/:officeId', authenticationMiddleware, requireSystemAdmin, controller.deleteOffice);
router.post('/:officeId/logo', authenticationMiddleware, requireSystemAdmin, uploadMiddleware.single('logo'), controller.uploadLogo);

export default router;