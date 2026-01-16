import { ZodError } from 'zod';
import logger from '#config/logger.js';

export const validate = schema => (req, res, next) => {
  try {
    const data = req.method === 'GET' ? req.query : req.body;
    req.body = schema.parse(data);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      logger.warn('Validation error:', {
        errors: validationErrors,
        ip: req.ip,
      });

      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
      });
    }
    next(error);
  }
};
