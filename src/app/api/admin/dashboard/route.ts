import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/dashboard - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Use middleware-provided headers (most reliable approach)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    // Validate authentication from middleware headers
    if (!userId || !userRole) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate authorization
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get dashboard statistics with proper error handling
    const [
      totalUsers,
      totalNews,
      totalComments,
      recentNews,
      recentComments,
      categoryStats,
      userStats
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.news.count().catch(() => 0),
      prisma.comment.count().catch(() => 0),
      prisma.news.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true
        }
      }).catch(() => []),
      prisma.comment.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          news: {
            include: {
              category: true
            }
          }
        }
      }).catch(() => []),
      prisma.category.findMany({
        include: {
          articles: true,
          _count: {
            select: { articles: true }
          }
        }
      }).catch(() => []),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }).catch(() => [])
    ]);

    console.log(`📊 Admin dashboard: Found ${totalComments} comments, ${recentComments.length} recent`);

    // Get monthly news count for chart (with error handling)
    let monthlyNews: any[] = [];
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const newsData = await prisma.news.findMany({
        where: {
          createdAt: {
            gte: sixMonthsAgo
          }
        },
        select: {
          createdAt: true
        }
      });
      
      // Group by month in JavaScript
      const monthGroups = newsData.reduce((acc, news) => {
        const monthKey = news.createdAt.toISOString().slice(0, 7); // YYYY-MM format
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      monthlyNews = Object.entries(monthGroups).map(([month, count]) => ({
        month: new Date(month + '-01'),
        count: Number(count)
      })).sort((a, b) => b.month.getTime() - a.month.getTime());
    } catch (error) {
      console.warn('Monthly news processing failed, using empty array');
      monthlyNews = [];
    }

    // Format the response data
    const formattedRecentComments = recentComments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.user ? {
        id: comment.user.id,
        name: comment.user.name,
        email: comment.user.email,
        role: comment.user.role,
        image: comment.user.image
      } : null,
      news: comment.news ? {
        id: comment.news.id,
        title: comment.news.title,
        category: comment.news.category ? {
          id: comment.news.category.id,
          name: comment.news.category.name,
          slug: comment.news.category.slug
        } : null,
        image: comment.news.image
      } : null
    }));

    // Get top commenters
    const topCommenters = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        _count: {
          select: { comments: true }
        }
      },
      orderBy: {
        comments: {
          _count: 'desc'
        }
      },
      take: 5
    }).catch(() => []);

    console.log(`🏆 Admin dashboard: Found ${topCommenters.length} top commenters`);

    const response = {
      success: true,
      data: {
        overview: {
          totalUsers,
          totalNews,
          totalComments
        },
        recentActivity: {
          news: recentNews,
          comments: formattedRecentComments
        },
        analytics: {
          categories: categoryStats,
          users: userStats,
          monthlyNews,
          topCommenters: topCommenters.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            commentCount: user._count.comments
          }))
        }
      }
    };

    console.log('✅ Admin dashboard: Data fetched successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Admin dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}