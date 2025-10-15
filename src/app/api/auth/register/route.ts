// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Assuming your prisma client is here
import bcrypt from 'bcryptjs';
import { signJWT, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from '@/lib/auth';
import { z } from 'zod';

// Your existing validation schema is excellent, let's keep it.
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  contactNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validate input
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    const { name, email, password, contactNumber } = validationResult.data;

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists.' },
        { status: 409 } // 409 Conflict
      );
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        contactNumber,
        role: 'USER', // Default role for new sign-ups
      },
    });

    // 5. Create JWTs for the new user (auto-login)
    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name ?? undefined,
      role: newUser.role,
    };

    const accessToken = signJWT(tokenPayload, ACCESS_TOKEN_EXPIRES_IN);
    const refreshToken = signJWT(tokenPayload, REFRESH_TOKEN_EXPIRES_IN);

    // 6. Create response and set secure cookies
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
    });

    // Set the access token cookie
    response.cookies.set('authToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    // Set the refresh token cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
        return NextResponse.json(
            { success: false, error: 'A user with this email already exists.' },
            { status: 409 }
        );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}