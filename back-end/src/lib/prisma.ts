import { PrismaClient, Prisma } from '@prisma/client';

// Create a singleton instance of PrismaClient to be used across the application
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle connection errors
prisma.$connect()
    .then(() => {
        console.log('✅ Connected to the database');
    })
    .catch((error: Error) => {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    });

// Add shutdown hook
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;