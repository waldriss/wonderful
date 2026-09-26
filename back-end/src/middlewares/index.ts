import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { rateLimit } from 'express-rate-limit';
import { toNodeHandler } from "better-auth/node";

import { config } from '../config';
import { auth } from '../lib/auth';
import logger from '../utils/logger';
import { rateLimitLogger } from './rate-limit-logger';

/**
 * Setup all middleware for the Express application
 */
export function setupMiddleware(app: Express): void {
  // CORS configuration
  app.use(cors({
    origin: config.isProduction 
      ? [config.auth.frontendUrl, config.auth.baseURL]
      : true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-CSRF-Token',
      'credentials',
      'Cookie',
      'X-Requested-With',
      'Accept'
    ],
    exposedHeaders: [
      'Content-Disposition',
      'Content-Type',
      'Content-Length'
    ],
    credentials: true, // Important for auth cookies
    maxAge: 86400, // Cache preflight requests for 24 hours
  }));

  // Better Auth handler - must be before body parsers
  app.all("/api/auth/*splat", toNodeHandler(auth));
  
  // Request body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Security headers middleware
  app.use(helmet());
  
  // Compression middleware
  app.use(compression());
  
  // Rate limiting - only in production or if explicitly enabled
  if (config.features.enableRateLimit) {
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Limit each IP to 1000 requests per window
        standardHeaders: true,
        message: { 
          success: false,
          message: 'Too many requests from this IP, please try again later' 
        },
        skip: (req) => {
          // Skip for health checks
          if (req.path === '/health' || req.path === '/api/health') return true;
          return false;
        },
      })
    );
    
    // Add rate limit monitoring
    app.use(rateLimitLogger);
  }
  
  // Request logging middleware
  app.use(
    morgan(config.isProduction ? 'combined' : 'dev', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );

  // Serve uploaded product images as static files
  // Accessible at /storage/products/<filename>
  // Must set Cross-Origin-Resource-Policy: cross-origin so the frontend (different port/origin)
  // can load images — helmet sets same-origin by default which blocks cross-origin image loads.
  app.use(
    '/storage',
    (_req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(path.join(process.cwd(), 'storage'), {
      index: false,
      dotfiles: 'deny',
    })
  );
}
