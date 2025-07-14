// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = err.details || err.errors;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    const field = Object.keys(err.keyValue)[0];
    details = `${field} already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else {
      message = 'File upload error';
    }
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong';
    details = null;
  }

  const errorResponse = {
    error: message,
    status: statusCode,
    timestamp: new Date().toISOString()
  };

  if (details) {
    errorResponse.details = details;
  }

  // Add request ID for tracking
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

// Async error wrapper to catch async errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Rate limit error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    status: 429,
    timestamp: new Date().toISOString(),
    retryAfter: req.rateLimit?.resetTime
  });
};

// CORS error handler
const corsErrorHandler = (err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'Cross-origin request blocked',
      status: 403,
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

// Request timeout handler
const timeoutHandler = (req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Request timeout',
        message: 'Request took too long to process',
        status: 408,
        timestamp: new Date().toISOString()
      });
    }
  }, 30000); // 30 seconds timeout

  res.on('finish', () => {
    clearTimeout(timeout);
  });

  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  rateLimitHandler,
  corsErrorHandler,
  timeoutHandler
};