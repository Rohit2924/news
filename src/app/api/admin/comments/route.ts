// app/api/admin/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { jwtVerify } from 'jose';
import { parse } from 'cookie';

const getTokenPayload = async (req: NextRequest) => {
  // Get token from cookie instead of Authorization header
  const cookies = req.headers.get('cookie') || '';
  const parsedCookies = parse(cookies);
  const token = parsedCookies.authToken;
  
  if (!token) throw new Error('Unauthorized');
  
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev');
  const { payload } = await jwtVerify(token, secretKey);
  return payload as any;
};

export async function GET(req: NextRequest) {
  try {
    const payload = await getTokenPayload(req);
    if (payload.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          news: { select: { id: true, title: true } },
        },
      }),
      prisma.comment.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: comments.map(c => ({
        id: c.id.toString(),
        content: c.content,
        createdAt: c.createdAt,
        user: c.user,
        newsId: c.newsId,
        newsTitle: c.news?.title,
      })),
      pagination: { page, limit, total },
    });
  } catch (error: any) {
    console.error('GET /admin/comments error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch comments' }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = await getTokenPayload(req);
    if (payload.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '');
    if (!id) return NextResponse.json({ success: false, error: 'Comment ID is required' }, { status: 400 });

    const deleted = await prisma.comment.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Comment ID ${deleted.id} deleted successfully`,
    });
  } catch (error: any) {
    console.error('DELETE /admin/comments error:', error);
    const status = error.code === 'P2025' ? 404 : 500; // P2025 = record not found
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete comment',
    }, { status });
  }
}
