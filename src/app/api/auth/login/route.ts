import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { signJWT } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: true, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: true, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // For now, we'll do a simple password comparison
    // In production, you should hash passwords
    // const isValidPassword = await bcrypt.compare(password, user.password);
    
    // Temporary: Allow any password for existing users, or specific test passwords
    const isValidPassword = password === 'password123' || 
                           (email === 'admin@example.com' && password === 'admin123') ||
                           (email === 'test@example.com' && password === '123456');

    if (!isValidPassword) {
      return NextResponse.json(
        { error: true, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signJWT({
      id: user.id,
      email: user.email
    });

    if (!token) {
      return NextResponse.json(
        { error: true, message: 'Failed to generate token' },
        { status: 500 }
      );
    }

    // Return user data and token
    return NextResponse.json({
      error: false,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          contactNumber: user.contactNumber
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}