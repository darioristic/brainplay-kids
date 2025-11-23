import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  familyName: z.string().min(2),
  subdomain: z.string().min(2).regex(/^[a-z0-9-]+$/),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Check if subdomain is taken
    const existingTenant = await db.tenant.findUnique({
      where: { subdomain: validated.subdomain },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Subdomain already taken' },
        { status: 400 }
      );
    }

    // Create tenant
    const tenant = await db.tenant.create({
      data: {
        subdomain: validated.subdomain,
        name: validated.familyName,
        active: true,
      },
    });

    // Create user
    const hashedPassword = await hashPassword(validated.password);
    const user = await db.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        role: 'PARENT',
      },
    });

    // Create family
    const family = await db.family.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        name: validated.familyName,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: tenant.id,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain,
        name: tenant.name,
      },
      family: {
        id: family.id,
        name: family.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

