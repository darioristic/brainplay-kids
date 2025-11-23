import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTenantIdFromRequest } from '@/lib/middleware-auth';
import { getAIClient } from '@/services/geminiService';
import { z } from 'zod';
import { getAgeGroup } from '@/types';

const generateQuestionSchema = z.object({
  gameModuleId: z.string(),
  childId: z.string().optional(),
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
    const validated = generateQuestionSchema.parse(body);

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

    // If childId provided, verify child belongs to tenant
    let child = null;
    if (validated.childId) {
      child = await db.child.findFirst({
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
    }

    // Determine age group for personalization
    const ageGroup = child ? getAgeGroup(child.age) : null;

    // Build prompt for Gemini AI
    const categoryDescriptions: Record<string, string> = {
      MATH: 'mathematics and arithmetic',
      LOGIC: 'logical reasoning and pattern recognition',
      MEMORY: 'memory and recall exercises',
      CREATIVITY: 'creative thinking and storytelling',
      LANGUAGE: 'language, vocabulary, and grammar',
    };

    const difficultyDescriptions: Record<string, string> = {
      Easy: 'simple and straightforward',
      Medium: 'moderately challenging',
      Hard: 'complex and advanced',
    };

    const ageGroupDescriptions: Record<string, string> = {
      EARLY: 'for children aged 0-4 years (very simple, visual, concrete)',
      DISCOVERY: 'for children aged 5-8 years (engaging, colorful, fun)',
      JUNIOR: 'for children aged 9-13 years (more abstract, challenging)',
    };

    const categoryDesc = categoryDescriptions[gameModule.category] || gameModule.category.toLowerCase();
    const difficultyDesc = difficultyDescriptions[gameModule.difficulty] || gameModule.difficulty.toLowerCase();
    const ageGroupDesc = ageGroup ? ageGroupDescriptions[ageGroup] : 'for children';

    const prompt = `Generate an educational question for a children's learning game.

Category: ${categoryDesc}
Difficulty: ${difficultyDesc}
Target Age: ${ageGroupDesc}
Minimum Age: ${gameModule.minAge} years

Requirements:
- The question should be appropriate for the specified category, difficulty, and age group
- The question should be clear, engaging, and educational
- The correct answer should be a single word, number, or short phrase (max 20 characters)
- For MATH: Generate arithmetic problems (addition, subtraction, multiplication, division)
- For LOGIC: Generate pattern recognition, sequencing, or logical reasoning questions
- For MEMORY: Generate questions about remembering sequences, patterns, or facts
- For CREATIVITY: Generate open-ended questions that encourage creative thinking
- For LANGUAGE: Generate vocabulary, spelling, or grammar questions

Respond with JSON in this exact format:
{
  "question": "The question text here",
  "correctAnswer": "The correct answer here"
}`;

    // Generate question using Gemini AI
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const result = JSON.parse(response.text || '{}');

    if (!result.question || !result.correctAnswer) {
      return NextResponse.json(
        { error: 'Failed to generate valid question' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      question: result.question,
      correctAnswer: result.correctAnswer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Generate question error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

