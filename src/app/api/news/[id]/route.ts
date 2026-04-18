import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

/**
 * @swagger
 * tags:
 *   - name: News
 *     description: Manage individual news articles
 */

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Get a specific news article
 *     description: Fetch a single news article by its ID, including comments with user info.
 *     tags:
 *       - News
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the news article
 *     responses:
 *       200:
 *         description: News article fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *       400:
 *         description: Invalid news ID
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a news article
 *     description: Admin-only endpoint to update an existing news article.
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the news article
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               author:
 *                 type: string
 *               published_date:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string
 *               summary:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: News article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid news ID
 *       401:
 *         description: Authentication required or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a news article
 *     description: Admin-only endpoint to delete a news article along with related comments.
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the news article
 *     responses:
 *       200:
 *         description: News article deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid news ID
 *       401:
 *         description: Authentication required or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         subcategory:
 *           type: string
 *         author:
 *           type: string
 *         published_date:
 *           type: string
 *           format: date-time
 *         image:
 *           type: string
 *         summary:
 *           type: string
 *         content:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               content:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               user:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   image:
 *                     type: string
 */



// GET /api/news/[id] - Get a specific news article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        comments: {
          include: {
            user: {
              select: { name: true, email: true, image: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: news
    });

  } catch (error) {
    console.error('Error fetching news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news article' },
      { status: 500 }
    );
  }
}

// PUT /api/news/[id] - Update a news article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // FIX: Properly handle verifyJWT return type
    const validation = verifyJWT(token);
    if (!validation.isValid || !validation.payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // FIX: Access role from payload, not directly from validation result
    const userRole = (validation.payload as any).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if news article exists
    const existingNews = await prisma.news.findUnique({
      where: { id }
    });

    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: 'News article not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, category, author, published_date, image, summary, content, tags } = body;

    // Update news article
    const updatedNews = await prisma.news.update({
      where: { id },
      data: {
        title,
        category,
        author,
        published_date,
        image,
        summary,
        content,
        tags,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedNews,
      message: 'News article updated successfully'
    });

  } catch (error) {
    console.error('Error updating news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update news article' },
      { status: 500 }
    );
  }
}

// DELETE /api/news/[id] - Delete a news article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // FIX: Properly handle verifyJWT return type
    const validation = verifyJWT(token);
    if (!validation.isValid || !validation.payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // FIX: Access role from payload, not directly from validation result
    const userRole = (validation.payload as any).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if news article exists
    const existingNews = await prisma.news.findUnique({
      where: { id }
    });

    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: 'News article not found' },
        { status: 404 }
      );
    }

    // Delete related comments first
    await prisma.comment.deleteMany({
      where: { newsId: id }
    });

    // Delete news article
    await prisma.news.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'News article deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete news article' },
      { status: 500 }
    );
  }
}