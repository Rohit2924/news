import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { Server as SocketIOServer } from 'socket.io';

// Helper function to get token from request
function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }
  return null;
}

// Analytics endpoint
export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyJWT(token);
    if (!payload || !payload.payload || payload.payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get analytics data
    const [totalUsers, totalArticles, totalComments] = await Promise.all([
      prisma.user.count(),
      prisma.news.count(),
      prisma.comment.count()
    ]);

    // Mock data for views and growth (in a real app, you'd track this)
    const totalViews = Math.floor(Math.random() * 10000) + 5000;
    const userGrowth = Math.floor(Math.random() * 20) - 10;
    const articleGrowth = Math.floor(Math.random() * 15) + 5;
    const commentGrowth = Math.floor(Math.random() * 25) + 10;
    const viewGrowth = Math.floor(Math.random() * 15) + 8;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalArticles,
        totalComments,
        totalViews,
        userGrowth,
        articleGrowth,
        commentGrowth,
        viewGrowth
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Socket.io server setup for real-time features
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    // Get socket server instance (this would be set up in your main server file)
    const io = (request as any).socket?.server?.io;
    
    if (!io) {
      return NextResponse.json(
        { success: false, error: 'Socket server not available' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'userRegistered':
        io.emit('userRegistered', data);
        break;
        
      case 'articlePublished':
        io.emit('articlePublished', data);
        break;
        
      case 'commentPosted':
        io.emit('commentPosted', data);
        break;
        
      case 'analyticsUpdate':
        // Get real-time analytics data
        const [totalUsers, totalArticles, totalComments] = await Promise.all([
          prisma.user.count(),
          prisma.news.count(),
          prisma.comment.count()
        ]);
        
        const totalViews = Math.floor(Math.random() * 10000) + 5000;
        const popularArticles = await prisma.news.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, title: true, category: true }
        });
        
        io.emit('analyticsUpdate', {
          totalUsers,
          totalArticles,
          totalComments,
          totalViews,
          popularArticles: popularArticles?.map(article => ({
            ...article,
            views: Math.floor(Math.random() * 1000) + 100
          }))
        });
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error handling socket action:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
