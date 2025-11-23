import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTenantIdFromRequest } from '@/lib/middleware-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await params;
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    // Verify child belongs to tenant
    const child = await db.child.findFirst({
      where: {
        id: childId,
        family: {
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

    const progress = await db.gameProgress.findMany({
      where: { childId },
      include: {
        gameModule: true,
      },
      orderBy: {
        lastPlayed: 'desc',
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Get child progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

