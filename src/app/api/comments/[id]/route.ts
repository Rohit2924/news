import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { parse } from 'cookie';
import { jwtVerify } from 'jose';

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: Endpoints for editing and deleting user comments
 */

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Edit a comment
 *     tags:
 *       - Comments
 *     description: Edit a comment by its ID. Users can only edit their own comments.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the comment to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated comment content"
 *     responses:
 *       200:
 *         description: Comment updated successfully
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
 *         description: Content missing or invalid
 *       401:
 *         description: Unauthorized (invalid/missing token)
 *       403:
 *         description: Forbidden (user cannot edit others’ comments)
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a comment
 *     tags:
 *       - Comments
 *     description: Delete a comment by its ID. Users can only delete their own comments.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *       401:
 *         description: Unauthorized (invalid/missing token)
 *       403:
 *         description: Forbidden (user cannot delete others’ comments)
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */


// function getToken(req: NextRequest) {
//   const cookies = req.headers.get('cookie') || '';
//   const parsed = parse(cookies);
//   return parsed.authToken || null;
// }

// PUT - Edit comment
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // FIX: Await the params Promise
    const { id } = await params;
    
    // const token = getToken(req);
    const token = req.cookies.get('auth-token')?.value;
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
      where: { id: Number(id) },  
      include: { user: true }
    });

    if (!existingComment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.userId !== userId) {
      return NextResponse.json({ success: false, error: 'You can only edit your own comments' }, { status: 403 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: Number(id) },  
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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // FIX: Await the params Promise
    const { id } = await params;
    
   const token = req.cookies.get('auth-token')?.value;

    console.log(token);
    
  if (!token) {
  const error = new Error("Unauthorized: No token provided");
  return NextResponse.json({ success: false, error: error.message }, { status: 401 });
}


    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-development');
    const payload = await jwtVerify(token, secretKey);
    const userId = (payload.payload as any).id as string;

    const existingComment = await prisma.comment.findUnique({
      where: { id: Number(id) },  
      include: { user: true }
    });

    if (!existingComment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.userId !== userId) {
      return NextResponse.json({ success: false, error: 'You can only delete your own comments' }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: Number(id) } });  

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}