import { Router } from 'express';
import { login, register, generateApiKey, listApiKeys, getMetrics, getMe, deleteApiKey } from './controllers.js';
import { validateRequest, loginSchema, registerSchema } from './validations.js';
import { requireAuth } from '../../middlewares/jwtAuth.js';

const router = Router();

router.post('/auth/register', validateRequest(registerSchema), register);
router.post('/auth/login', validateRequest(loginSchema), login);

router.post('/keys/generate', requireAuth, generateApiKey);
router.get('/keys', requireAuth, listApiKeys);
router.delete('/keys/:keyId', requireAuth, deleteApiKey);

router.get('/metrics', requireAuth, getMetrics);
router.get('/auth/me', requireAuth, getMe);

export default router;

