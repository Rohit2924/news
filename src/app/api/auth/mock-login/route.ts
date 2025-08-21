import { NextRequest, NextResponse } from 'next/server';
import { signJWT } from '@/lib/auth';

// Mock login endpoint that doesn't require database
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

    // Mock user data for testing
    const mockUsers = [
      {
        id: 'user_1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        password: 'admin123',
        image: null,
        contactNumber: null
      },
      {
        id: 'user_2',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        password: 'password123',
        image: null,
        contactNumber: null
      },
      {
        id: 'user_3',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user',
        password: 'password123',
        image: null,
        contactNumber: null
      }
    ];

    // Find user
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
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
    console.error('Mock login error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}