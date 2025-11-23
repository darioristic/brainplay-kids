import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest, getTenantIdFromRequest } from '@/lib/middleware-auth';
import { z } from 'zod';
import { AgeGroup, Difficulty } from '@prisma/client';

const updateSettingsSchema = z.object({
  buddy: z.nativeEnum(AgeGroup).optional(),
  preferredDifficulty: z.nativeEnum(Difficulty).optional(),
  themePreference: z.nativeEnum(AgeGroup).optional(),
  settings: z.record(z.any()).optional(),
});

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
    const validated = updateSettingsSchema.parse(body);

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

    console.error('Update child settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

