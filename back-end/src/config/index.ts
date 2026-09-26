import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3001'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  
  // Auth related environment variables
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_BASE_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  
  // Feature flags
  ENABLE_RATE_LIMIT: z.string().optional().transform(val => val === 'true'),

  // Web Push (VAPID)
  WEB_PUSH_VAPID_PUBLIC_KEY: z.string().optional().default(''),
  WEB_PUSH_VAPID_PRIVATE_KEY: z.string().optional().default(''),
  WEB_PUSH_SUBJECT: z.string().optional().default('mailto:admin@wonderful.local'),

  // Gamification settings
  POINTS_PER_DA: z.string().default('10'), // 10 points par 100 DA
  POINTS_REDEMPTION_RATE: z.string().default('100'), // 1000 points = 100 DA
});

// Validate and extract environment variables
const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('❌ Environment validation error:');
  envVars.error.errors.forEach(e => {
    console.error(`   - ${e.path.join('.')}: ${e.message}`);
  });
  process.exit(1);
}

export const config = {
  nodeEnv: envVars.data.NODE_ENV,
  port: parseInt(envVars.data.PORT, 10),
  logLevel: envVars.data.LOG_LEVEL,
  isDevelopment: envVars.data.NODE_ENV === 'development',
  isProduction: envVars.data.NODE_ENV === 'production',
  isTest: envVars.data.NODE_ENV === 'test',
  
  // Feature flags
  features: {
    enableRateLimit: envVars.data.ENABLE_RATE_LIMIT ?? envVars.data.NODE_ENV === 'production',
  },
  
  // Auth configuration
  auth: {
    secret: envVars.data.BETTER_AUTH_SECRET,
    baseURL: envVars.data.BETTER_AUTH_BASE_URL,
    googleClientId: envVars.data.GOOGLE_CLIENT_ID,
    googleClientSecret: envVars.data.GOOGLE_CLIENT_SECRET,
    frontendUrl: envVars.data.FRONTEND_URL,
  },
  
  // Gamification configuration
  gamification: {
    pointsPerDA: parseInt(envVars.data.POINTS_PER_DA, 10),
    pointsRedemptionRate: parseInt(envVars.data.POINTS_REDEMPTION_RATE, 10),
  },

  // Web Push configuration
  webPush: {
    vapidPublicKey: envVars.data.WEB_PUSH_VAPID_PUBLIC_KEY,
    vapidPrivateKey: envVars.data.WEB_PUSH_VAPID_PRIVATE_KEY,
    subject: envVars.data.WEB_PUSH_SUBJECT,
    isConfigured: Boolean(envVars.data.WEB_PUSH_VAPID_PUBLIC_KEY && envVars.data.WEB_PUSH_VAPID_PRIVATE_KEY),
  },
};
