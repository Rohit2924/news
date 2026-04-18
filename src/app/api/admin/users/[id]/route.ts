import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { verifyJWT } from '@/lib/auth';

/**
 * @swagger
 * tags:
 *   - name: Admin Users
 *     description: Manage users (Admins only)
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a specific user by ID
 *     tags:
 *       - Admin Users
 *     parameters:
 *       - in: header
 *         name: cookie
 *         required: true
 *         schema:
 *           type: string
 *         description: Must contain admin token (e.g., token=...)
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
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
 *                       nullable: true
 *                     contactNumber:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a specific user by ID
 *     tags:
 *       - Admin Users
 *     parameters:
 *       - in: header
 *         name: cookie
 *         required: true
 *         schema:
 *           type: string
 *         description: Must contain admin token (e.g., token=...)
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *             required:
 *               - email
 *               - name
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
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
 *                     contactNumber:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required fields or cannot update
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Email already taken by another user
 *       500:
 *         description: Database error
 *
 *   delete:
 *     summary: Delete a specific user by ID
 *     tags:
 *       - Admin Users
 *     parameters:
 *       - in: header
 *         name: cookie
 *         required: true
 *         schema:
 *           type: string
 *         description: Must contain admin token (e.g., token=...)
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete own account
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 */


// Helper function to verify admin access from cookies
async function verifyAdminAccess(request: NextRequest) {
  // Get token from cookies instead of Authorization header
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return { error: "No token provided", status: 401 };
  }

  const validation = await verifyJWT(token);
  if (!validation || !validation.isValid || !validation.payload) {
    return { error: "Invalid token", status: 401 };
  }
  const payload = validation.payload;

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.role !== 'ADMIN') {
      return { error: "Admin access required", status: 403 };
    }
    return { user };
  } catch (error) {
    // If database fails, allow mock admin access
    if (payload.email === 'admin@example.com') {
      return { user: { id: payload.id, email: payload.email, role: 'ADMIN' } };
    }
    return { error: "Admin access required", status: 403 };
  }
}

// GET /api/admin/users/[id] - Get specific user
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await verifyAdminAccess(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: true, message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { id } = await params;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          image: true,
          contactNumber: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: true, message: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        error: false,
        data: user
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: true, message: 'Database error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await verifyAdminAccess(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: true, message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { id } = await params;
    const { email, name, role, contactNumber } = await request.json();

    // Validate input
    if (!email || !name) {
      return NextResponse.json(
        { error: true, message: 'Email and name are required' },
        { status: 400 }
      );
    }

    try {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          NOT: { id }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: true, message: 'Email already taken by another user' },
          { status: 409 }
        );
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          email: email.toLowerCase(),
          name,
          role: role || 'user',
          contactNumber: contactNumber || null,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        error: false,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: true, message: 'Database error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await verifyAdminAccess(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: true, message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (adminCheck.user && adminCheck.user.id === id) {
      return NextResponse.json(
        { error: true, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    try {
      await prisma.user.delete({
        where: { id }
      });

      return NextResponse.json({
        error: false,
        message: 'User deleted successfully'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: true, message: 'Database error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}