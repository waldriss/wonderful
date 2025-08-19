import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';

/**
 * Extend the Express Request to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles?: string[];
        [key: string]: any;
      };
      session?: any;
    }
  }
}

/**
 * Middleware to authenticate the request using better-auth
 * Attaches the session and user to the request object
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the session from better-auth using request headers
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    // Attach session to request for downstream middleware and route handlers
    req.session = session;
    
    // If user exists in session, attach it to request
    if (session?.user) {
      req.user = session.user;
    }
    
    next();
  } catch (error) {
    // Don't throw error here - simply proceed without setting user
    // This allows the authenticated routes to handle the auth check
    next();
  }
};

/**
 * Middleware to require authentication
 * Must be used after the authenticate middleware
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }
  next();
};

/**
 * Middleware factory to require specific roles
 * @param roles - Array of roles allowed to access the route
 */
export const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // First check if user is authenticated
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    // Then check if user has required role
    const userRoles = req.user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return next(
        new AppError('Insufficient permissions to access this resource', 403)
      );
    }
    
    next();
  };
};



