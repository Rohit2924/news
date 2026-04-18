// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints for users
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags:
 *       - Auth
 *     description: Returns information about the currently authenticated user based on the auth-token cookie.
 *     responses:
 *       200:
 *         description: User is authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 authenticated:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1234abcd"
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         role:
 *                           type: string
 *                           example: "ADMIN"
 *                         image:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *       401:
 *         description: Authentication required or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 authenticated:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "No token found"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 authenticated:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */


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
