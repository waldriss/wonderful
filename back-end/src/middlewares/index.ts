import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import logger from '../utils/logger';
import { config } from '../config';
import { toNodeHandler } from "better-auth/node";
import { auth } from '../lib/auth';

export function setupMiddleware(app: Express): void {
   // CORS configuration
   app.use(cors({
    // Use specific origin instead of wildcard for credential-based requests
    origin:'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true, // Important for auth cookies
    maxAge: 86400, // Cache preflight requests for 24 hours (in seconds)
  }));
  app.all("/api/auth/*splat", toNodeHandler(auth));
  
  // Request body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Security headers middleware
  app.use(helmet());
  
 
  
  // Compression middleware
  app.use(compression());
  
  // Rate limiting
  if (config.nodeEnv === 'production') {
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per window
        standardHeaders: true,
        message: 'Too many requests from this IP, please try again later',
      })
    );
  }
  
  // Request logging middleware
  app.use(
    morgan(config.nodeEnv === 'production' ? 'combined' : 'dev', {
      stream: {
        write: (message: string) => logger.info(message.trim()), // Changed from http to info which is a standard Pino log level
      },
    })
  );
}
