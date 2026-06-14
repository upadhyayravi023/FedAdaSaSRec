import { ZodError } from 'zod';
import { UploadGradientsSchema, TelemetrySchema } from './schemas.js';
import Tenant from '../../models/Tenant.js';

export class SdkController {
  constructor(sdkService) {
    this.sdkService = sdkService;
  }

  getLatestModel = async (req, res, next) => {
    try {
      const { tenantId } = req;

      if (!tenantId) {
        return res.status(401).json({ error: 'Unauthorized: Missing tenant context', status: 401 });
      }

      const result = await this.sdkService.getLatestModelUrls(tenantId);
      
      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      next(error);
    }
  };

  uploadGradients = async (req, res, next) => {
    try {
      const { tenantId } = req;

      if (!tenantId) {
        return res.status(401).json({ error: 'Unauthorized: Missing tenant context', status: 401 });
      }

      const parsedBody = UploadGradientsSchema.parse({
        body: req.body,
      });

      const { deviceId, clickCount } = parsedBody.body;

      const uploadDetails = await this.sdkService.initiateGradientUpload(
        tenantId,
        deviceId,
        clickCount
      );

      res.status(200).json({
        success: true,
        data: uploadDetails,
      });

    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.errors,
          status: 400,
        });
        return;
      }
      next(error);
    }
  };

  telemetry = async (req, res, next) => {
    try {
      const { tenantId } = req;

      if (!tenantId) {
        return res.status(401).json({ error: 'Unauthorized: Missing tenant context', status: 401 });
      }

      const parsedBody = TelemetrySchema.parse({
        body: req.body,
      });

      const { deviceId, recommendationsServed } = parsedBody.body;

      await Tenant.findByIdAndUpdate(tenantId, {
        $inc: { 'metrics.dailyRecommendations': recommendationsServed }
      });

      res.status(200).json({
        success: true,
        message: 'Telemetry recorded successfully'
      });

    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.errors,
          status: 400,
        });
        return;
      }
      next(error);
    }
  };
}

