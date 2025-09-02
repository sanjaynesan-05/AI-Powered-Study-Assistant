/**
 * Request logging middleware
 * Logs details about incoming requests for debugging
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  if (Object.keys(req.body).length > 0) {
    // Mask sensitive data
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[MASKED]';
    console.log('Request Body:', sanitizedBody);
  }
  
  // Capture response data
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);
    
    // Log response details
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] Response ${res.statusCode} - ${duration}ms`);
  };
  
  next();
};

module.exports = requestLogger;
