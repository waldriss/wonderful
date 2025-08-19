import { Request, Response, NextFunction, Express } from 'express';
import logger from '../utils/logger';
import { AppError, isAppError } from '../utils/errors';

// 404 handler
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Global error handler
const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default error values
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
      err,
      req: {
        method: req.method,
        url: req.url,
      },
      message: err.message,
    });
  }

  // Customize error response based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(isDevelopment && { stack: err.stack }),
    ...(isAppError(err) && err.data && { data: err.data }),
  });
};

export function setupErrorHandlers(app: Express): void {
  // Route not found handler - must be after all routes
  app.use(notFoundHandler);
  
  // Global error handler - must be last middleware
  app.use(errorHandler);
}
