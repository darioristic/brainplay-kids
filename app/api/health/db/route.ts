import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/db';

/**
 * Health check endpoint for database connection
 * Useful for debugging database connection issues
 */
export async function GET(request: NextRequest) {
  try {
    // Check if DATABASE_URL is set
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    
    if (!hasDatabaseUrl) {
      return NextResponse.json({
        status: 'error',
        message: 'DATABASE_URL environment variable is not set',
        databaseUrl: false,
        connection: false,
      }, { status: 500 });
    }

    // Test database connection
    const connectionTest = await testDatabaseConnection();

    if (connectionTest.success) {
      return NextResponse.json({
        status: 'ok',
        message: 'Database connection successful',
        databaseUrl: true,
        connection: true,
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        databaseUrl: true,
        connection: false,
        error: connectionTest.error,
        hint: 'Please check your DATABASE_URL and ensure the database is running',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

