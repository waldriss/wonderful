import pino from 'pino';
import { config } from '../config';

/**
 * Pino logger instance configured based on environment
 * - Development: Pretty printed with colors
 * - Production: JSON format for log aggregation
 */
const logger = pino({
  level: config.logLevel,
  transport: 
    config.isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        } 
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    env: config.nodeEnv,
  },
});

export default logger;
