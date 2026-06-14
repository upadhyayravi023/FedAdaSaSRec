import { Router } from 'express';
import { triggerAggregationPost, modelReadyWebhookPost } from './controllers.js';
import { validateRequest, triggerAggregationSchema, webhookModelReadySchema } from './validations.js';
import { internalOnly } from '../../middlewares/internalOnly.js';

const router = Router();

router.post('/trigger-aggregation', internalOnly, validateRequest(triggerAggregationSchema), triggerAggregationPost);
router.post('/webhook-model-ready', internalOnly, validateRequest(webhookModelReadySchema), modelReadyWebhookPost);

export default router;
