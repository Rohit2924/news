import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/news/[id]/comments - Get comments for a specific news article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const newsId = parseInt(params.id);
    
    if (isNaN(newsId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    // Check if news article exists
    const news = await prisma.news.findUnique({
      where: { id: newsId },
      select: { id: true, title: true }
    });

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News article not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Get comments with pagination
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { newsId },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder === 'desc' ? 'desc' : 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true
            }
          }
        }
      }),
      prisma.comment.count({
        where: { newsId }
      })
    ]);

    // Format comments for response
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        email: comment.user.email,
        image: comment.user.image,
        role: comment.user.role
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        news: {
          id: news.id,
          title: news.title
        },
        comments: formattedComments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching news comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
