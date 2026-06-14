import { Router } from 'express';
import { SdkController } from './controllers.js';
import { SdkService } from './services.js';

const router = Router();

// Initialize mock service without DB/Kafka
const sdkService = new SdkService();
const sdkController = new SdkController(sdkService);

import Tenant from '../../models/Tenant.js';

router.use(async (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key) {
    return res.status(401).json({ error: 'Unauthorized: Missing API Key', status: 401 });
  }

  try {
    const tenant = await Tenant.findOne({ apiKeys: key });
    if (!tenant) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API Key', status: 401 });
    }
    req.tenantId = tenant._id;
    next();
  } catch (error) {
    next(error);
  }
});

router.get('/model/latest', sdkController.getLatestModel);
router.post('/gradients/upload', sdkController.uploadGradients);
router.post('/telemetry', sdkController.telemetry);

export default router;

