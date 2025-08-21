import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { signJWT } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: true, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: true, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: true, message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // For now, we'll store password as plain text (NOT RECOMMENDED FOR PRODUCTION)
    // In production, hash the password: const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || email,
        role: 'user',
        // password: hashedPassword, // Add this field to schema in production
      }
    });

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
      message: 'Registration successful',
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}