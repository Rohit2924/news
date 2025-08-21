import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { verifyJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: true, message: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: true, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: true, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json({
      error: false,
      message: 'Token is valid',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          contactNumber: user.contactNumber
        }
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}