import express from 'express';
import { createServer } from 'http';
import { config } from './config';
import { setupMiddleware } from './middlewares';
import { setupRoutes } from './routes';
import { setupErrorHandlers } from './middlewares/errorHandlers';
import { initializeSocket } from './lib/socket';
import logger from './utils/logger';

async function startServer() {
  try {
    const app = express();

    // Setup middleware (CORS, body parsers, security, etc.)
    setupMiddleware(app);
    
    // Setup API routes
    setupRoutes(app);

    // Setup error handlers (must be after routes)
    setupErrorHandlers(app);

    // Create HTTP server
    const server = createServer(app);

    // Initialize Socket.IO (must be before server.listen)
    initializeSocket(server);

    // Start listening
    server.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 API: http://localhost:${config.port}/api`);
      logger.info(`❤️  Health: http://localhost:${config.port}/api/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.fatal({ error }, 'Uncaught Exception');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled Rejection');
    });

  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start the server
startServer();
