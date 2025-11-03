// app/api/admin/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { getAuthToken, verifyJWT } from '@/lib/auth';

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest): Promise<{ user?: any; error?: string; status?: number }> {
  // Method 1: Check middleware headers (preferred)
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  if (userId && userRole) {
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return { error: "Admin or Editor access required", status: 403 };
    }

    return { 
      user: {
        id: userId,
        email: request.headers.get("x-user-email") || '',
        role: userRole,
      }
    };
  }

  // Method 2: Fallback - verify JWT token directly from cookies/headers
  const token = getAuthToken(request);
  if (!token) {
    return { error: "No authentication token found", status: 401 };
  }

  const validation = verifyJWT(token);
  if (!validation.isValid || !validation.payload) {
    return { 
      error: validation.error || "Invalid or expired token", 
      status: 401 
    };
  }

  if (validation.payload.role !== 'ADMIN' && validation.payload.role !== 'EDITOR') {
    return { error: "Admin or Editor access required", status: 403 };
  }

  // Verify user still exists in database
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: validation.payload.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return { error: "Admin or Editor access required", status: 403 };
    }

    return { user: validation.payload };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { error: "Failed to verify user", status: 500 };
  }
}

export async function GET(req: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 401 }
      );
    }

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
    const authCheck = await verifyAdminAccess(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 401 }
      );
    }

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
