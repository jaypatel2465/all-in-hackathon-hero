const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const { logger } = require('../utils/logger');

/**
 * Verify JWT token middleware
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const result = await query(
      `SELECT u.id, u.employee_id, u.email, u.status
       FROM users u 
       WHERE u.id = $1 AND u.status = 'active'`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return ApiResponse.unauthorized(res, 'User not found or inactive');
    }

    // Get user role
    const roleResult = await query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [decoded.userId]
    );

    req.user = {
      ...result.rows[0],
      role: roleResult.rows[0]?.role || 'employee'
    };
    
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expired');
    }
    return ApiResponse.unauthorized(res, 'Invalid token');
  }
};

/**
 * Role-based access control middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await query(
      `SELECT u.id, u.employee_id, u.email, u.status
       FROM users u 
       WHERE u.id = $1 AND u.status = 'active'`,
      [decoded.userId]
    );

    if (result.rows.length > 0) {
      const roleResult = await query(
        'SELECT role FROM user_roles WHERE user_id = $1',
        [decoded.userId]
      );
      req.user = {
        ...result.rows[0],
        role: roleResult.rows[0]?.role || 'employee'
      };
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
