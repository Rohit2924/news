import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, signJWT, ACCESS_TOKEN_EXPIRES_IN } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints for users
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
 *     description: Issues a new access token using a valid refresh token from cookies.
 *     responses:
 *       200:
 *         description: Access token successfully refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token refreshed"
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
 *         description: Refresh token missing or invalid
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
 *                   example: "No refresh token provided"
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


export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refresh-token')?.value;
    if (!refreshToken) {
      return NextResponse.json({ success: false, error: 'No refresh token provided' }, { status: 401 });
    }
    // Verify refresh token
    const result = verifyJWT(refreshToken);
    if (!result.isValid || !result.payload) {
      return NextResponse.json({ success: false, error: 'Invalid or expired refresh token' }, { status: 401 });
    }
    // Optionally, check user still exists and is active
    const user = await prisma.user.findUnique({ where: { id: result.payload.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    // Issue new access token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role: user.role,
      image: user.image ?? undefined,
    };
    const newAccessToken = signJWT(tokenPayload, ACCESS_TOKEN_EXPIRES_IN);
    // Set new access token cookie
    const response = NextResponse.json({ success: true, message: 'Token refreshed', data: { user: tokenPayload } });
    response.cookies.set('auth-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
