/**
 * Custom application error class with status code support
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly data?: unknown;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, data?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = 'AppError';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

// ============================================
// Common error factory functions
// ============================================

export const createBadRequestError = (message: string, data?: unknown) => 
  new AppError(message, 400, data);

export const createValidationError = (message: string, data?: unknown) => 
  new AppError(message, 400, data);

export const createUnauthorizedError = (message: string = 'Unauthorized') => 
  new AppError(message, 401);

export const createForbiddenError = (message: string = 'Forbidden') => 
  new AppError(message, 403);

export const createNotFoundError = (resource: string) => 
  new AppError(`${resource} not found`, 404);

export const createConflictError = (message: string) => 
  new AppError(message, 409);

export const createInternalError = (message: string = 'Internal server error') => 
  new AppError(message, 500);
