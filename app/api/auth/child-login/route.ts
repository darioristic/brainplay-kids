import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPIN } from '@/lib/auth';
import { z } from 'zod';

const childLoginSchema = z.object({
  subdomain: z.string(),
  childId: z.string(),
  pin: z.string().length(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = childLoginSchema.parse(body);

    // Get tenant
    const tenant = await db.tenant.findUnique({
      where: { subdomain: validated.subdomain },
    });

    if (!tenant || !tenant.active) {
      return NextResponse.json(
        { error: 'Invalid subdomain' },
        { status: 404 }
      );
    }

    // Find child
    const child = await db.child.findFirst({
      where: {
        id: validated.childId,
        family: {
          tenantId: tenant.id,
        },
      },
    });

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    // Verify PIN
    const isValid = await verifyPIN(validated.pin, child.pin);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      child: {
        id: child.id,
        name: child.name,
        age: child.age,
        avatarUrl: child.avatarUrl,
        points: child.points,
        buddy: child.buddy,
        preferredDifficulty: child.preferredDifficulty,
        themePreference: child.themePreference,
      },
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain,
        name: tenant.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Child login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

