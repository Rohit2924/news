import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * @swagger
 * /api/news/{id}/comments:
 *   get:
 *     summary: Get comments for a specific news article
 *     tags:
 *       - News Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the news article
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of comments per page
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order for comments based on creation date
 *     responses:
 *       200:
 *         description: Successfully fetched comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     news:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         title:
 *                           type: string
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                                 nullable: true
 *                               email:
 *                                 type: string
 *                               image:
 *                                 type: string
 *                                 nullable: true
 *                               role:
 *                                 type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       400:
 *         description: Invalid news ID or pagination parameters
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal server error
 */



// Define TypeScript interfaces for type safety
interface CommentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

interface CommentWithUser {
  id: number;
  content: string;
  createdAt: Date;
  user: CommentUser;
}

interface FormattedComment {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
}

// GET /api/news/[id]/comments - Get comments for a specific news article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise
    const { id } = await params;
    const newsId = parseInt(id);
    
    // Validate news ID
    if (isNaN(newsId) || newsId <= 0) {
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
    
    // Validate and sanitize pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20')), 100); // Max 100 per page
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const skip = (page - 1) * limit;

    // Get comments with pagination
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { newsId },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
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
      }) as Promise<CommentWithUser[]>,
      prisma.comment.count({
        where: { newsId }
      })
    ]);

    // Format comments for response with proper typing
    const formattedComments: FormattedComment[] = comments.map((comment: CommentWithUser) => ({
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
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching news comments:', error);
    
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? (error as Error).message 
      : 'Failed to fetch comments';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}