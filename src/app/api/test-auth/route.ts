// src/app/api/test-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const headers = {
    'x-user-id': request.headers.get('x-user-id'),
    'x-user-role': request.headers.get('x-user-role'),
    'x-user-email': request.headers.get('x-user-email'),
    'x-auth-token': request.headers.get('x-auth-token'),
  };

  return NextResponse.json({
    success: true,
    message: 'Test endpoint',
    headers,
    hasAuth: !!headers['x-user-id']
  });
}