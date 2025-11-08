import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

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
        { status: 409 }
      );
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the new user (NO TOKENS CREATED HERE)
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        contactNumber,
        role: 'USER',
      },
    });

    // 5. Return success response WITHOUT setting cookies
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please login to continue.',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
    });

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