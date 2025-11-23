import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTenantIdFromRequest } from '@/lib/middleware-auth';
import { z } from 'zod';
import { checkAnswerQuickly } from '@/services/geminiService';

const submitAnswerSchema = z.object({
  answer: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = submitAnswerSchema.parse(body);

    // Get session
    const session = await db.gameSession.findUnique({
      where: { id: params.id },
      include: {
        child: {
          include: {
            family: {
              where: {
                tenantId,
              },
            },
          },
        },
      },
    });

    if (!session || !session.child.family) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check answer using AI
    const isCorrect = await checkAnswerQuickly(session.question, validated.answer);

    // Update session
    const updated = await db.gameSession.update({
      where: { id: params.id },
      data: {
        userAnswer: validated.answer,
        isCorrect,
      },
    });

    return NextResponse.json({
      session: updated,
      isCorrect,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Submit answer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

