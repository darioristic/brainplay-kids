import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Helper endpoint to check if admin user exists
 * Useful for debugging and setup verification
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json({
        exists: false,
        message: 'No admin user found. Please run: npm run db:seed',
      });
    }

    return NextResponse.json({
      exists: true,
      admin: {
        email: adminUser.email,
        name: adminUser.name,
      },
      message: 'Admin user exists. You can login with: admin@brainplaykids.com / admin123',
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json(
      {
        exists: false,
        error: 'Database connection error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

