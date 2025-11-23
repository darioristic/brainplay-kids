import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest, getTenantIdFromRequest } from '@/lib/middleware-auth';
import { hashPIN } from '@/lib/auth';
import { z } from 'zod';
import { AgeGroup, Difficulty } from '@prisma/client';

const createChildSchema = z.object({
  familyId: z.string(),
  name: z.string().min(1),
  age: z.number().int().min(0).max(13),
  pin: z.string().length(4).regex(/^\d+$/),
  avatarUrl: z.string().url(),
  buddy: z.nativeEnum(AgeGroup).optional(),
  preferredDifficulty: z.nativeEnum(Difficulty).optional(),
  themePreference: z.nativeEnum(AgeGroup).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    // Get family first
    const family = await db.family.findFirst({
      where: {
        userId: auth.userId,
        tenantId,
      },
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    const children = await db.child.findMany({
      where: { familyId: family.id },
      orderBy: { name: 'asc' },
      include: {
        gameProgress: true,
      },
    });

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Get children error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = createChildSchema.parse(body);

    // Verify family belongs to user
    const family = await db.family.findFirst({
      where: {
        id: validated.familyId,
        userId: auth.userId,
        tenantId,
      },
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    const hashedPIN = await hashPIN(validated.pin);

    const child = await db.child.create({
      data: {
        familyId: validated.familyId,
        name: validated.name,
        age: validated.age,
        pin: hashedPIN,
        avatarUrl: validated.avatarUrl,
        buddy: validated.buddy,
        preferredDifficulty: validated.preferredDifficulty,
        themePreference: validated.themePreference,
        points: 0,
      },
    });

    return NextResponse.json({ child }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create child error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

