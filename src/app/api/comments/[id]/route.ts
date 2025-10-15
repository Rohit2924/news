import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { parse } from 'cookie';
import { jwtVerify } from 'jose';

function getToken(req: NextRequest) {
  const cookies = req.headers.get('cookie') || '';
  const parsed = parse(cookies);
  return parsed.authToken || null;
}

// PUT - Edit comment
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-development');
    const payload = await jwtVerify(token, secretKey);
    const userId = (payload.payload as any).id as string;

    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: Number(params.id) },
      include: { user: true }
    });

    if (!existingComment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.userId !== userId) {
      return NextResponse.json({ success: false, error: 'You can only edit your own comments' }, { status: 403 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: Number(params.id) },
      data: { content: content.trim() },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    return NextResponse.json({ success: true, comment: updatedComment });

  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete comment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-development');
    const payload = await jwtVerify(token, secretKey);
    const userId = (payload.payload as any).id as string;

    const existingComment = await prisma.comment.findUnique({
      where: { id: Number(params.id) },
      include: { user: true }
    });

    if (!existingComment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.userId !== userId) {
      return NextResponse.json({ success: false, error: 'You can only delete your own comments' }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: Number(params.id) } });

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}