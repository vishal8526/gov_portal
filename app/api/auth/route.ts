/**
 * ============================================================================
 * Auth API Routes — POST /api/auth/login & POST /api/auth/register
 * ============================================================================
 * Handles user authentication and registration with proper validation,
 * password hashing, and session cookie management.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, authenticateUser, createSession } from '@/lib/auth';
import { registerSchema, loginSchema } from '@/lib/validators';

/**
 * POST /api/auth — Handles both login and register based on request body
 * Body: { action: 'login' | 'register', ...data }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'register') {
      return handleRegister(data);
    } else if (action === 'login') {
      return handleLogin(data);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** Handles user registration with validation and duplicate checking */
async function handleRegister(data: Record<string, unknown>) {
  // Validate input
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password, role, phone } = result.data;

  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists' },
      { status: 409 }
    );
  }

  // Create user with hashed password
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, phone },
  });

  // Create session
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

/** Handles user login with credential verification */
async function handleLogin(data: Record<string, unknown>) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password } = result.data;
  const user = await authenticateUser(email, password);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  // Create session
  await createSession(user);

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
