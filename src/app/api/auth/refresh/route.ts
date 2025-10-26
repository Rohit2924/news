import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, signJWT, ACCESS_TOKEN_EXPIRES_IN } from '@/lib/auth';
import prisma from '@/lib/db';

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
      secure: process.env.NODE_ENV === 'production',
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
