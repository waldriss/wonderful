/**
 * Shared error class for application errors
 * Re-exported from utils for convenience
 */
export { 
  AppError, 
  isAppError,
  createBadRequestError,
  createValidationError,
  createUnauthorizedError,
  createForbiddenError,
  createNotFoundError,
  createConflictError,
  createInternalError,
} from '../../utils/errors';
