import { z } from 'zod';

export const uploadCatalogSchema = z.object({
  body: z.array(
    z.object({
      sku: z.string({ required_error: 'sku is required' }).min(1),
      title: z.string({ required_error: 'title is required' }).min(1),
    })
  ).min(1, 'Catalog array cannot be empty')
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
