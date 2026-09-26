import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { UserRole, UserStatus } from '@prisma/client';
import prisma from '../lib/prisma';

/**
 * User type with full profile information
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * Extend the Express Request to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      session?: unknown;
    }
  }
}

/**
 * Middleware to authenticate the request using better-auth
 * Attaches the session and user to the request object
 * Also fetches user role and status from database
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
    
    // Attach session to request
    req.session = session;
    
    // Fetch full user data including role and status
    if (session?.user) {
      const fullUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
        },
      });

      if (fullUser && fullUser.status === UserStatus.ACTIVE) {
        req.user = {
          id: fullUser.id,
          email: fullUser.email,
          name: fullUser.name ?? undefined,
          firstName: fullUser.firstName ?? undefined,
          lastName: fullUser.lastName ?? undefined,
          role: fullUser.role,
          status: fullUser.status,
        };
      }
    }
    
    next();
  } catch (error) {
    // Don't throw error - proceed without setting user
    // This allows authenticated routes to handle the auth check
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
export const requireRoles = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // First check if user is authenticated
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    
    next();
  };
};

/**
 * Middleware to require admin role (ADMIN or SUPER_ADMIN)
 */
export const requireAdmin = requireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

/**
 * Middleware to require super admin role only
 */
export const requireSuperAdmin = requireRoles([UserRole.SUPER_ADMIN]);
