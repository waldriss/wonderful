import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Format Zod error into user-friendly messages
 */
const formatZodError = (error: ZodError) => {
  const errors = error.errors.map(err => {
    const fieldPath = err.path.join('.');
    let message = err.message;
    
    // Customize messages based on error type
    switch (err.code) {
      case 'invalid_type':
        message = `Expected ${err.expected} but received ${err.received}`;
        break;
      case 'too_small':
        if (err.type === 'string') {
          message = `Must be at least ${err.minimum} characters`;
        } else if (err.type === 'number') {
          message = `Must be at least ${err.minimum}`;
        } else if (err.type === 'array') {
          message = `Must contain at least ${err.minimum} items`;
        }
        break;
      case 'too_big':
        if (err.type === 'string') {
          message = `Must be at most ${err.maximum} characters`;
        } else if (err.type === 'number') {
          message = `Must be at most ${err.maximum}`;
        } else if (err.type === 'array') {
          message = `Must contain at most ${err.maximum} items`;
        }
        break;
      case 'invalid_string':
        if (err.validation === 'email') {
          message = 'Invalid email format';
        } else if (err.validation === 'uuid') {
          message = 'Invalid ID format';
        } else if (err.validation === 'url') {
          message = 'Invalid URL format';
        }
        break;
      case 'invalid_enum_value':
        message = `Invalid value. Expected one of: ${err.options.join(', ')}`;
        break;
      case 'invalid_date':
        message = 'Invalid date format';
        break;
    }

    return {
      field: fieldPath,
      message,
      code: err.code,
    };
  });

  return {
    errors,
    summary: `Validation failed on ${errors.length} field(s)`,
  };
};

/**
 * Middleware to validate request body using Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsedData = schema.parse(req.body);
      req.body = parsedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatZodError(error);
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          details: formattedError.summary,
          errors: formattedError.errors,
        });
        return;
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate query parameters using Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsedQuery = schema.parse(req.query);
      // req.query is a getter-only in some router versions — use defineProperty
      Object.defineProperty(req, 'query', {
        value: parsedQuery,
        writable: true,
        configurable: true,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatZodError(error);
        
        res.status(400).json({
          success: false,
          message: 'Query validation failed',
          details: formattedError.summary,
          errors: formattedError.errors,
        });
        return;
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate URL parameters using Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsedParams = schema.parse(req.params);
      req.params = parsedParams;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatZodError(error);
        
        res.status(400).json({
          success: false,
          message: 'Parameter validation failed',
          details: formattedError.summary,
          errors: formattedError.errors,
        });
        return;
      }
      next(error);
    }
  };
};
