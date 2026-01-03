const { logger } = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Operational, trusted error
  if (err.isOperational) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return ApiResponse.badRequest(res, 'Duplicate entry found');
      case '23503': // foreign_key_violation
        return ApiResponse.badRequest(res, 'Referenced record does not exist');
      case '23502': // not_null_violation
        return ApiResponse.badRequest(res, 'Required field is missing');
      case '22P02': // invalid_text_representation
        return ApiResponse.badRequest(res, 'Invalid data format');
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expired');
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return ApiResponse.badRequest(res, 'Validation failed', errors);
  }

  // Unknown error
  return ApiResponse.error(res, 'Internal server error', 500);
};

module.exports = errorHandler;
