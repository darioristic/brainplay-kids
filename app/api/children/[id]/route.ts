import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest, getTenantIdFromRequest } from '@/lib/middleware-auth';
import { z } from 'zod';
import { AgeGroup, Difficulty } from '@prisma/client';

const updateChildSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.number().int().min(0).max(13).optional(),
  avatarUrl: z.string().url().optional(),
  buddy: z.nativeEnum(AgeGroup).optional(),
  preferredDifficulty: z.nativeEnum(Difficulty).optional(),
  themePreference: z.nativeEnum(AgeGroup).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    const child = await db.child.findFirst({
      where: {
        id,
        family: {
          tenantId,
        },
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        gameProgress: {
          include: {
            gameModule: true,
          },
        },
      },
    });

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ child });
  } catch (error) {
    console.error('Get child error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify child belongs to user's family
    const child = await db.child.findFirst({
      where: {
        id,
        family: {
          userId: auth.userId,
          tenantId,
        },
      },
    });

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateChildSchema.parse(body);

    const updated = await db.child.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ child: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update child error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify child belongs to user's family
    const child = await db.child.findFirst({
      where: {
        id,
        family: {
          userId: auth.userId,
          tenantId,
        },
      },
    });

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    await db.child.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Child deleted' });
  } catch (error) {
    console.error('Delete child error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

