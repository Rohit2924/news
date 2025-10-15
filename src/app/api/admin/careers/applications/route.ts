import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { verifyJWT } from '@/lib/auth';

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7);
  return (
    request.cookies.get('adminAuthToken')?.value ||
    request.cookies.get('editorAuthToken')?.value ||
    request.cookies.get('authToken')?.value ||
    null
  );
}

async function requireAdmin(request: NextRequest) {
  const token = getAuthToken(request);
  if (!token) return { error: 'No token provided', status: 401 } as const;
  const res = verifyJWT(token);
  if (!res.isValid || !res.payload) return { error: 'Invalid token', status: 401 } as const;
  if (res.payload.role !== 'ADMIN' && res.payload.role !== 'EDITOR') return { error: 'Unauthorized', status: 403 } as const;
  return { ok: true } as const;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const apps = await prisma.jobApplication.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, data: apps });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.jobApplication.delete({ where: { id } });
  return NextResponse.json({ success: true });
}


