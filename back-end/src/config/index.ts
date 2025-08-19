import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  
  // Auth related environment variables
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_BASE_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  
  // Add more environment variables as needed
  // DATABASE_URL: z.string(),
  // JWT_SECRET: z.string(),
});

// Validate and extract environment variables
const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  throw new Error(
    `Environment validation error: ${envVars.error.errors.map(e => `${e.path}: ${e.message}`).join(', ')}`
  );
}

export const config = {
  nodeEnv: envVars.data.NODE_ENV,
  port: parseInt(envVars.data.PORT, 10),
  logLevel: envVars.data.LOG_LEVEL,
  
  // Auth configuration
  auth: {
    secret: envVars.data.BETTER_AUTH_SECRET,
    baseURL: envVars.data.BETTER_AUTH_BASE_URL,
    googleClientId: envVars.data.GOOGLE_CLIENT_ID,
    googleClientSecret: envVars.data.GOOGLE_CLIENT_SECRET,
    corsOrigin: envVars.data.CORS_ORIGIN,
  },
  
  // Add more config variables as needed
};
