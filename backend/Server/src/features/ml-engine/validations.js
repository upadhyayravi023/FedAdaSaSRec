import { z } from 'zod';

export const triggerAggregationSchema = z.object({
  body: z.object({
    tenantId: z.string({ required_error: 'tenantId is required' }).min(1, 'tenantId cannot be empty'),
  }),
});

export const webhookModelReadySchema = z.object({
  body: z.object({
    tenantId: z.string({ required_error: 'tenantId is required' }).min(1, 'tenantId cannot be empty'),
    newModelVersion: z.string({ required_error: 'newModelVersion is required' }).min(1, 'newModelVersion cannot be empty'),
    newOnnxS3Url: z.string({ required_error: 'newOnnxS3Url is required' }).url('Must be a valid URL'),
  }),
});

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    req.body = parsed.body;
    req.query = parsed.query;
    req.params = parsed.params;
    
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Validation failed',
      status: 400,
      details: error.errors,
    });
  }
};
