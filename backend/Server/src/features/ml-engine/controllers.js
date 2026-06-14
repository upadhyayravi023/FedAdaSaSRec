import * as mlEngineService from './services.js';

export const triggerAggregationPost = async (req, res) => {
  try {
    const { tenantId } = req.body;
    const result = await mlEngineService.triggerAggregation(tenantId);
    
    return res.status(result.triggered ? 200 : 400).json(result);
  } catch (error) {
    console.error('Trigger Aggregation Error:', error);
    return res.status(500).json({ error: 'Internal server error', status: 500 });
  }
};

export const modelReadyWebhookPost = async (req, res) => {
  try {
    const { tenantId, newModelVersion, newOnnxS3Url } = req.body;
    const result = await mlEngineService.handleModelReadyWebhook(tenantId, newModelVersion, newOnnxS3Url);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Model Ready Webhook Error:', error);
    return res.status(500).json({ error: 'Internal server error', status: 500 });
  }
};
