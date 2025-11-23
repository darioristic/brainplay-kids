import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest, getTenantIdFromRequest } from '@/lib/middleware-auth';

export async function GET(
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

    // Verify family belongs to user and tenant
    const family = await db.family.findFirst({
      where: {
        id,
        userId: auth.userId,
        tenantId,
      },
      include: {
        children: {
          include: {
            gameSessions: {
              where: {
                completed: true,
              },
            },
            gameProgress: true,
          },
        },
      },
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalPoints = family.children.reduce((sum, child) => sum + (child.points || 0), 0);
    const totalSessions = family.children.reduce(
      (sum, child) => sum + (child.gameSessions?.length || 0),
      0
    );
    const activeChildren = family.children.length;

    // Get weekly activity
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklySessions = family.children.reduce(
      (sum, child) =>
        sum +
        (child.gameSessions?.filter(
          (session) => session.completedAt && new Date(session.completedAt) >= weekAgo
        ).length || 0),
      0
    );

    return NextResponse.json({
      stats: {
        totalPoints,
        totalSessions,
        activeChildren,
        weeklySessions,
        children: family.children.map((child) => ({
          id: child.id,
          name: child.name,
          points: child.points || 0,
          progress: child.gameProgress?.length || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Get family stats error:', error);
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

