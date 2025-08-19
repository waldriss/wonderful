import pino from 'pino';
import { config } from '../config';

// Create logger instance
const logger = pino({
  level: config.logLevel,
  transport: 
    config.nodeEnv !== 'production' 
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
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
