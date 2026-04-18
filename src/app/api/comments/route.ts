import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { getAuthToken, verifyJWT } from '@/lib/auth';

/**
 * GET - Fetch all comments for a specific news/article
 * Query parameter: newsId (required)
 */

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: Endpoints for fetching and posting comments on news articles
 */

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get comments
 *     tags:
 *       - Comments
 *     description: Fetch comments for a specific news/article or for the authenticated user.
 *     parameters:
 *       - in: query
 *         name: newsId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the news article to fetch comments for (required if mode != user)
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [user]
 *         required: false
 *         description: If set to "user", fetches all comments by the authenticated user
 *     responses:
 *       200:
 *         description: Comments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       content:
 *                         type: string
 *                       newsId:
 *                         type: integer
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Missing required query parameter (newsId)
 *       401:
 *         description: Unauthorized (invalid/missing token)
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Post a new comment
 *     tags:
 *       - Comments
 *     description: Create a new comment for a specific news article. Only regular users can post comments.
 *     parameters:
 *       - in: query
 *         name: newsId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the news article to post comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is my comment"
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     content:
 *                       type: string
 *                     newsId:
 *                       type: integer
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing newsId or invalid comment content
 *       401:
 *         description: Unauthorized (invalid/missing token)
 *       403:
 *         description: Forbidden (only regular users can post comments)
 *       500:
 *         description: Internal server error
 */


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');
    if (mode === 'user') {
      // Return comments for the authenticated user
      const token = getAuthToken(req);
      if (!token) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      const result = verifyJWT(token);
      if (!result.isValid || !result.payload) {
        return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
      }
      const userId = result.payload.id;
      const comments = await prisma.comment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          news: { select: { id: true, title: true, category: true } },
        },
      });
      return NextResponse.json({ success: true, data: { comments } });
    }

    // Default: Return comments for a specific news/article
    const newsId = searchParams.get('newsId');
    if (!newsId) {
      return NextResponse.json(
        { success: false, error: 'newsId is required' },
        { status: 400 }
      );
    }
    const comments = await prisma.comment.findMany({
      where: { newsId: Number(newsId) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load comments' },
      { status: 500 }
    );
  }
}
 
/**
 * POST - Create a new comment for a specific news/article
 * Query parameter: newsId (required)
 */
export async function POST(req: NextRequest) {
  try {
    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const result = verifyJWT(token);
    if (!result.isValid || !result.payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    const userId = result.payload.id;
    const role = (result.payload.role as string | undefined)?.toUpperCase();

    // Only regular users may post comments
    if (role !== 'USER') {
      return NextResponse.json({ success: false, error: 'Only regular users can post comments' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const newsId = searchParams.get('newsId');

    if (!newsId) {
      return NextResponse.json(
        { success: false, error: 'newsId is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { content } = body as { content: string };

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    if (content.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Comment must be at least 3 characters long' }, { status: 400 });
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ success: false, error: 'Comment must be less than 1000 characters' }, { status: 400 });
    }

    // Create the comment
    const newComment = await prisma.comment.create({
      data: {
        content: content.trim(),
        newsId: Number(newsId),
        userId: userId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      comment: newComment
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
