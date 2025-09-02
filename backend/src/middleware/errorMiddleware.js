// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error for server debugging
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  
  // Set appropriate status code (default to 500 if not set)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Send error response to client
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// Not Found middleware
const notFound = (req, res, next) => {
  console.error(`Route not found: ${req.method} ${req.originalUrl}`);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
