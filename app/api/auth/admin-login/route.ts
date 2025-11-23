import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { z } from 'zod';

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate input
    const validated = adminLoginSchema.parse(body);

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return NextResponse.json(
        { 
          error: 'Database configuration error',
          message: 'DATABASE_URL environment variable is not set. Please configure your database connection.',
          hint: 'Check your .env.local file or environment variables'
        },
        { status: 500 }
      );
    }

    // Find user
    let user;
    try {
      user = await db.user.findUnique({
        where: { email: validated.email },
      });
    } catch (dbError) {
      console.error('Database error when finding user:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      
      // Provide more helpful error messages
      let userFriendlyMessage = 'Database connection error. Please try again.';
      if (errorMessage.includes('P1001') || errorMessage.includes('Can\'t reach database')) {
        userFriendlyMessage = 'Cannot connect to database. Please check if the database is running and DATABASE_URL is correct.';
      } else if (errorMessage.includes('P1000') || errorMessage.includes('Authentication failed')) {
        userFriendlyMessage = 'Database authentication failed. Please check your DATABASE_URL credentials.';
      }
      
      return NextResponse.json(
        { 
          error: userFriendlyMessage,
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Verify password
    let isValid;
    try {
      isValid = await verifyPassword(validated.password, user.password);
    } catch (passwordError) {
      console.error('Password verification error:', passwordError);
      return NextResponse.json(
        { error: 'Authentication error. Please try again.' },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens (admin doesn't need tenantId)
    let accessToken, refreshToken;
    try {
      accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return NextResponse.json(
        { error: 'Token generation failed. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Admin login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

