export const errorHandler = (err, req, res, next) => {
  // Log the error natively to terminal/monitoring system (e.g., Datadog, Sentry)
  console.error('[Error Handler Log]:', err);

  // If status is 200 but we entered the error handler, it's an internal 500 error.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const finalStatus = err.status || statusCode;

  // Return clean JSON without leaking stack traces for security
  res.status(finalStatus).json({
    success: false,
    message: err.message || 'Internal Server Error',
    status: finalStatus
  });
};
