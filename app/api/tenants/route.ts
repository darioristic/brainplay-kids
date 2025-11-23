import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';

const createTenantSchema = z.object({
  subdomain: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  emoji: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // In development, allow access without authentication for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      // Check auth
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (!payload || payload.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    const tenants = await db.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { families: true },
        },
      },
    });

    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('Get tenants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // In development, allow access without authentication for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      // Check auth
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (!payload || payload.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validated = createTenantSchema.parse(body);

    // Check if subdomain exists
    const existing = await db.tenant.findUnique({
      where: { subdomain: validated.subdomain },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Subdomain already taken' },
        { status: 400 }
      );
    }

    const tenant = await db.tenant.create({
      data: {
        subdomain: validated.subdomain,
        name: validated.name,
        emoji: validated.emoji,
        active: true,
      },
    });

    return NextResponse.json({ tenant }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

