import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTenantIdFromRequest } from '@/lib/middleware-auth';

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    // Get child ID from query if provided
    const childId = request.nextUrl.searchParams.get('childId');

    const modules = await db.gameModule.findMany({
      orderBy: [
        { category: 'asc' },
        { difficulty: 'asc' },
      ],
    });

    // If childId provided, include progress
    if (childId) {
      const progress = await db.gameProgress.findMany({
        where: { childId },
      });

      const progressMap = new Map(
        progress.map((p) => [p.gameModuleId, p.progress])
      );

      const modulesWithProgress = modules.map((module) => ({
        ...module,
        progress: progressMap.get(module.id) || 0,
        locked: module.locked || false,
      }));

      return NextResponse.json({ modules: modulesWithProgress });
    }

    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Get game modules error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

