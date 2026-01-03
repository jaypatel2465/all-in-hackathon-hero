const ApiResponse = require('../utils/apiResponse');

/**
 * Validation middleware factory
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {string} source - 'body' | 'query' | 'params'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return ApiResponse.badRequest(res, 'Validation failed', errors);
      }
      
      // Replace with parsed/transformed data
      req[source] = result.data;
      next();
    } catch (error) {
      return ApiResponse.badRequest(res, 'Invalid request data');
    }
  };
};

module.exports = { validate };
