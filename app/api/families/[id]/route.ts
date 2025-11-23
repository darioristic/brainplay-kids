import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest, getTenantIdFromRequest } from '@/lib/middleware-auth';
import { z } from 'zod';

const updateFamilySchema = z.object({
  name: z.string().min(2).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify family belongs to user and tenant
    const family = await db.family.findFirst({
      where: {
        id: params.id,
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

    const body = await request.json();
    const validated = updateFamilySchema.parse(body);

    const updated = await db.family.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({ family: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update family error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

