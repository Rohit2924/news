import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

/**
 * @swagger
 * tags:
 *   - name: Admin Profile
 *     description: Admin/Editor profile management
 */

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get current admin/editor profile
 *     tags:
 *       - Admin Profile
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Bearer token for admin/editor access
 *     responses:
 *       200:
 *         description: Admin profile data
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
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     image:
 *                       type: string
 *                     contactNumber:
 *                       type: string
 *                     reputation:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                           news:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: number
 *                               title:
 *                                 type: string
 *                               category:
 *                                 type: string
 *       401:
 *         description: Authentication required or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch admin profile
 *
 *   post:
 *     summary: Update current admin/editor profile
 *     tags:
 *       - Admin Profile
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Bearer token for admin/editor access
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     image:
 *                       type: string
 *                     contactNumber:
 *                       type: string
 *                     reputation:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Name is required
 *       401:
 *         description: Authentication required or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update profile
 */


export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const result = verifyJWT(token);
    if (!result.isValid || !result.payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: result.payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        contactNumber: true,
        reputation: true,
        createdAt: true,
        updatedAt: true,
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            news: {
              select: {
                id: true,
                title: true,
                category: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        contactNumber: user.contactNumber,
        reputation: user.reputation,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        comments: user.comments
      }
    });

  } catch (error) {
    console.error('Admin profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const result = verifyJWT(token);
    if (!result.isValid || !result.payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, contactNumber } = body;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // Find user and check if admin
    const user = await prisma.user.findUnique({
      where: { id: result.payload.id }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: result.payload.id },
      data: {
        name: name.trim(),
        contactNumber: contactNumber?.trim() || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        contactNumber: true,
        reputation: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Admin profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
