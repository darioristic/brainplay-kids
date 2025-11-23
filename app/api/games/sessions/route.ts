import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTenantIdFromRequest } from '@/lib/middleware-auth';
import { z } from 'zod';

const createSessionSchema = z.object({
  childId: z.string(),
  gameModuleId: z.string(),
  question: z.string(),
  correctAnswer: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = createSessionSchema.parse(body);

    // Verify child belongs to tenant
    const child = await db.child.findFirst({
      where: {
        id: validated.childId,
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

    // Verify game module exists
    const gameModule = await db.gameModule.findUnique({
      where: { id: validated.gameModuleId },
    });

    if (!gameModule) {
      return NextResponse.json(
        { error: 'Game module not found' },
        { status: 404 }
      );
    }

    const session = await db.gameSession.create({
      data: {
        childId: validated.childId,
        gameModuleId: validated.gameModuleId,
        question: validated.question,
        correctAnswer: validated.correctAnswer,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create game session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

