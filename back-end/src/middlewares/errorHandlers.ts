import { Request, Response, NextFunction, Express } from 'express';
import logger from '../utils/logger';
import { AppError, isAppError } from '../utils/errors';
import { config } from '../config';

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Determine status code
  const statusCode = isAppError(err) ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  
  // Log the error
  if (statusCode >= 500) {
    logger.error({
      err,
      req: {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        body: req.body,
      },
      message: 'Internal server error',
    });
  } else {
    logger.warn({
      err: {
        message: err.message,
        statusCode,
      },
      req: {
        method: req.method,
        url: req.url,
      },
      message: err.message,
    });
  }

  // Send error response
  const response: Record<string, unknown> = {
    success: false,
    status: 'error',
    statusCode,
    message,
  };

  if (config.isDevelopment) {
    response.stack = err.stack;
  }

  if (isAppError(err) && err.data) {
    response.data = err.data;
  }

  res.status(statusCode).json(response);
};

/**
 * Setup error handlers - must be called after all routes
 */
export function setupErrorHandlers(app: Express): void {
  // Route not found handler
  app.use(notFoundHandler);
  
  // Global error handler - must be last
  app.use(errorHandler);
}
