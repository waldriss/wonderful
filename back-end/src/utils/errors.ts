export class AppError extends Error {
  statusCode: number;
  data?: Record<string, any>;
  isOperational: boolean;

  constructor(
    message: string, 
    statusCode: number = 500,
    data?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.isOperational = true; // Used to identify operational vs programming errors
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', data?: Record<string, any>) {
    super(message, 400, data);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', data?: Record<string, any>) {
    super(message, 401, data);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', data?: Record<string, any>) {
    super(message, 403, data);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', data?: Record<string, any>) {
    super(message, 404, data);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', data?: Record<string, any>) {
    super(message, 422, data);
  }
}

export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}
