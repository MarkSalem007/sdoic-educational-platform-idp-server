import express from 'express';
import * as controller from './office.controllers.js';
import authenticationMiddleware from '../../middlewares/authenticate.middleware.js';
import uploadMiddleware from '../../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/', authenticationMiddleware, controller.createOffice);
router.get('/', authenticationMiddleware, controller.getOffices);
router.get('/:officeId', authenticationMiddleware, controller.getOffice);
router.patch('/:officeId', authenticationMiddleware, controller.updateOffice);
router.delete('/:officeId', authenticationMiddleware, controller.deleteOffice);
router.post('/:officeId/logo', authenticationMiddleware, uploadMiddleware.single('logo'), controller.uploadLogo);

export default router;