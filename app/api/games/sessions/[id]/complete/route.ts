import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTenantIdFromRequest } from '@/lib/middleware-auth';

export async function POST(
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

    // Get session
    const session = await db.gameSession.findUnique({
      where: { id },
      include: {
        child: {
          include: {
            family: true,
          },
        },
        gameModule: true,
      },
    });

    if (!session || !session.child.family || session.child.family.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.completed) {
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      );
    }

    // Calculate points (only if correct)
    const points = session.isCorrect ? session.gameModule.rewardPoints : 0;

    // Update session
    await db.gameSession.update({
      where: { id },
      data: {
        completed: true,
        points,
        completedAt: new Date(),
      },
    });

    // Update child points
    await db.child.update({
      where: { id: session.childId },
      data: {
        points: {
          increment: points,
        },
      },
    });

    // Update or create progress
    const progress = await db.gameProgress.upsert({
      where: {
        childId_gameModuleId: {
          childId: session.childId,
          gameModuleId: session.gameModuleId,
        },
      },
      update: {
        progress: {
          increment: session.isCorrect ? 10 : 0,
        },
        lastPlayed: new Date(),
      },
      create: {
        childId: session.childId,
        gameModuleId: session.gameModuleId,
        progress: session.isCorrect ? 10 : 0,
        lastPlayed: new Date(),
      },
    });

    return NextResponse.json({
      points,
      progress: progress.progress,
    });
  } catch (error) {
    console.error('Complete session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

