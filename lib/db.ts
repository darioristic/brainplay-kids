import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('⚠️  DATABASE_URL environment variable is not set!');
  console.error('Please set DATABASE_URL in your .env.local file or environment variables.');
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Helper function to test database connection
export async function testDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    await db.$queryRaw`SELECT 1`;
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database connection test failed:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

