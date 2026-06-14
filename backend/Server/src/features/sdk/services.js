import Tenant from '../../models/Tenant.js';
import TrainingJob from '../../models/TrainingJob.js';

export class SdkService {
  constructor() {}

  async getLatestModelUrls(tenantId) {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const version = tenant.activeModelVersion || 'v1';
    const onnxUrl = tenant.activeModelUrl || `https://r2.storage.dev/${tenant._id}/models/${version}/global.onnx`;
    const translationMapUrl = `https://r2.storage.dev/${tenant._id}/models/${version}/translation_map.json`;

    return {
      version,
      urls: {
        globalHollowOnnx: onnxUrl,
        translationMap: translationMapUrl,
      },
    };
  }

  async initiateGradientUpload(tenantId, deviceId, clickCount) {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');
    
    const timestamp = Date.now();
    const objectKey = `${tenantId}/gradients/${deviceId}_${timestamp}.pt`;
    const uploadUrl = `https://r2.storage.dev/upload/${objectKey}`;

    await TrainingJob.create({
      tenantId,
      deviceId,
      s3ObjectKey: objectKey,
      gradientS3Url: `s3://gradients-bucket/${objectKey}`,
      clickCount,
      status: 'pending'
    });

    return {
      uploadUrl,
      objectKey,
    };
  }
}

