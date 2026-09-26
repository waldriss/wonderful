/**
 * Common types used across the application
 */
import { Request, Response, NextFunction } from 'express';

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Async handler wrapper type
 */
export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;
