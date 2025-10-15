import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import * as cookie from 'cookie';

async function getTokenFromRequest(request: NextRequest) {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }
  
  // Fallback to cookie
  const cookies = request.headers.get('cookie') || '';
  const parsedCookies = cookie.parse(cookies);
  return parsedCookies.authToken;
}

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const validation = verifyJWT(token);
    if (!validation || !validation.isValid || !validation.payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    const payload = validation.payload;

    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const reportedUserId = body.reportedUserId || body.userId; // Support both
    const { reason, commentId } = body;
    
    if (!reportedUserId || !reason) {
      return NextResponse.json(
        { success: false, error: 'User ID and reason are required' },
        { status: 400 }
      );
    }
    
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId }
    });
    
    if (!reportedUser) {
      return NextResponse.json(
        { success: false, error: 'Reported user not found' },
        { status: 404 }
      );
    }
    
    const report = await prisma.userReport.create({
      data: {
        reporterId: user.id,
        reportedUserId,
        commentId: commentId || null,
        reason,
        status: 'PENDING'
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'User reported successfully',
      data: report
    });

  } catch (error) {
    console.error('Error reporting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to report user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get all pending reports
  const reports = await prisma.userReport.findMany({
    where: { status: 'PENDING' },
    include: {
      reporter: { select: { name: true, email: true } },
      reportedUser: { select: { name: true, email: true } },
      comment: { select: { content: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json({ success: true, data: reports });
}

export async function PUT(request: NextRequest) {
  // Approve or reject a report
  const { reportId, status } = await request.json(); // status: 'APPROVED' | 'REJECTED'
  
  const report = await prisma.userReport.update({
    where: { id: reportId },
    data: { status }
  });
  
  return NextResponse.json({ success: true, data: report });
}