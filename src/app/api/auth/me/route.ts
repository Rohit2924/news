// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // // Debug: Log all cookies
    // console.log('🔍 [/api/auth/me] All cookies:', request.cookies.getAll());
    
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('🔍 [/api/auth/me] Auth token exists:', !!token);
    if (token) {
      console.log('🔍 [/api/auth/me] Token start:', token.substring(0, 50));
    }

    if (!token) {
      console.log('❌ [/api/auth/me] No auth token found');
      return NextResponse.json(
        { success: false, authenticated: false, error: 'No token found' },
        { status: 401 }
      );
    }

    // Verify token
    const result = verifyJWT(token);
    console.log('🔍 [/api/auth/me] Token verification result:', { 
      isValid: result.isValid, 
      hasPayload: !!result.payload,
      error: result.error 
    });

    if (!result.isValid || !result.payload) {
      console.log('❌ [/api/auth/me] Token verification failed:', result.error);
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Invalid token' },
        { status: 401 }
      );
    }



    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: result.payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
    });

    if (!user) {
      console.log('❌ [/api/auth/me] User not found in DB:', result.payload.id);
      return NextResponse.json(
        { success: false, authenticated: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ [/api/auth/me] User authenticated:', user.id);
    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        },
      },
    });

  } catch (error) {
    console.error('❌ [/api/auth/me] Error:', error);
    return NextResponse.json(
      {
        success: false, error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
