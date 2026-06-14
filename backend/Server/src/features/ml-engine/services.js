import Tenant from '../../models/Tenant.js';
import TrainingJob from '../../models/TrainingJob.js';

export const triggerAggregation = async (tenantId) => {
  const pendingJobs = await TrainingJob.find({ tenantId, status: 'pending' });
  const pendingCount = pendingJobs.length;

  if (pendingCount > 0) {
    const gradientUrls = pendingJobs.map(job => job.gradientS3Url);

    await TrainingJob.updateMany(
      { tenantId, status: 'pending' },
      { $set: { status: 'processing' } }
    );

    const pythonUrl = process.env.PYTHON_ML_SERVER_URL || 'http://localhost:5000/aggregate';
    fetch(pythonUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId,
        gradientUrls
      })
    }).catch(err => {
      console.error('[ML Service] Failed to trigger Python aggregation server:', err.message);
    });
  }

  return { 
    message: 'Aggregation triggered successfully',
    triggered: pendingCount > 0,
    gradientsCount: pendingCount
  };
};

export const handleModelReadyWebhook = async (tenantId, newModelVersion, newOnnxS3Url) => {
  await Tenant.findByIdAndUpdate(tenantId, {
    $set: {
      activeModelVersion: newModelVersion,
      activeModelUrl: newOnnxS3Url,
      activeModelUpdatedAt: new Date()
    }
  });

  await TrainingJob.updateMany(
    { tenantId, status: 'processing' },
    { $set: { status: 'completed' } }
  );

  return { message: 'Webhook processed successfully. Tenant and jobs updated.' };
};

