export const internalOnly = (req, res, next) => {
  // Static secret for internal service-to-service communication
  // Must be provided in environment variables in production
  const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'dev_internal_secret';
  
  const headerSecret = req.headers['x-internal-secret'];

  if (!headerSecret || headerSecret !== INTERNAL_SECRET) {
    return res.status(403).json({
      error: 'Forbidden. Invalid or missing internal secret.',
      status: 403
    });
  }

  next();
};
