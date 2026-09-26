import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] 
    : ['error'],
});

// Handle connection
prisma.$connect()
  .then(() => {
    logger.info('✅ Connected to the database');
  })
  .catch((error: Error) => {
    logger.error({ error }, '❌ Unable to connect to the database');
    process.exit(1);
  });

// Add shutdown hook for graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
});

export default prisma;
