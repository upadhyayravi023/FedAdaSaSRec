import { Router } from 'express';
import { uploadCatalog, publishMap, getCatalogItems } from './controllers.js';
import { validateRequest, uploadCatalogSchema } from './validations.js';
import { requireAuth } from '../../middlewares/jwtAuth.js'; 

const router = Router();

router.use(requireAuth);

router.post('/upload', validateRequest(uploadCatalogSchema), uploadCatalog);
router.post('/publish', publishMap);
router.get('/items', getCatalogItems);

export default router;
