import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware to monitor rate limiting and log warnings
 * when requests approach the limit
 */
export const rateLimitLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log when a request is near the limit
  const remaining = parseInt(res.getHeader('X-RateLimit-Remaining') as string);
  const limit = parseInt(res.getHeader('X-RateLimit-Limit') as string);
  
  if (remaining && limit && remaining < limit * 0.1) { // 10% remaining
    logger.warn({
      ip: req.ip,
      remaining,
      limit,
      path: req.path,
      userAgent: req.get('User-Agent')
    }, 'Rate limit warning');
  }
  
  next();
};
