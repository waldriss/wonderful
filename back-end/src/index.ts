import express from 'express';
import { config } from './config';
import { setupMiddleware } from './middlewares';
import { setupRoutes } from './routes';
import { setupErrorHandlers } from './middlewares/errorHandlers';
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

    const server = app.listen(config.port, () => {
      logger.info(`Server running at http://localhost:${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
