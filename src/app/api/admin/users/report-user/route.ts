import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import * as cookie from 'cookie';

/**
 * @swagger
 * tags:
 *   - name: Admin User Reports
 *     description: Manage user reports (Admins only)
 */

/**
 * @swagger
 * /api/admin/users/reports:
 *   get:
 *     summary: Get all pending user reports
 *     tags:
 *       - Admin User Reports
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for admin access
 *     responses:
 *       200:
 *         description: List of pending reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       reporter:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       reportedUser:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       comment:
 *                         type: object
 *                         properties:
 *                           content:
 *                             type: string
 *                       reason:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [PENDING, APPROVED, REJECTED]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to fetch reports
 *
 *   post:
 *     summary: Report a user
 *     tags:
 *       - Admin User Reports
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportedUserId:
 *                 type: string
 *               reason:
 *                 type: string
 *               commentId:
 *                 type: string
 *             required:
 *               - reportedUserId
 *               - reason
 *     responses:
 *       200:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     reporterId:
 *                       type: string
 *                     reportedUserId:
 *                       type: string
 *                     commentId:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PENDING, APPROVED, REJECTED]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing user ID or reason
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Reported user not found
 *       500:
 *         description: Failed to report user
 *
 *   put:
 *     summary: Approve or reject a user report
 *     tags:
 *       - Admin User Reports
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *             required:
 *               - reportId
 *               - status
 *     responses:
 *       200:
 *         description: Report status updated successfully
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
 *                     reporterId:
 *                       type: string
 *                     reportedUserId:
 *                       type: string
 *                     commentId:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PENDING, APPROVED, REJECTED]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to update report
 */


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

async function verifyAdminAccess(request: NextRequest): Promise<{ user?: any; error?: string; status?: number }> {
  // Debug: Log all headers to see what middleware is sending
  console.log('🔐 Admin API - All Headers:', {
    'x-user-id': request.headers.get('x-user-id'),
    'x-user-role': request.headers.get('x-user-role'),
    'x-user-email': request.headers.get('x-user-email'),
    'x-auth-token': request.headers.get('x-auth-token') ? 'present' : 'missing',
    'authorization': request.headers.get('authorization'),
    'cookie': request.headers.get('cookie')
  });

  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  if (!userId || !userRole) {
    console.log('❌ No user headers found');
    return { error: "No authentication token found", status: 401 };
  }

  if (userRole !== 'ADMIN') {
    console.log('❌ User is not admin:', userRole);
    return { error: "Admin access required", status: 403 };
  }

  return { 
    user: {
      id: userId,
      email: request.headers.get("x-user-email") || '',
      role: userRole
    }
  };
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
  try {
    console.log('🔄 Admin users API called');
    const authCheck = await verifyAdminAccess(request);
    
    if (authCheck.error) {
      console.log('🚫 Auth check failed:', authCheck.error);
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 401 }
      );
    }

    console.log('✅ Admin access granted for user:', authCheck.user);
    // ... rest of your GET logic
  } catch (error) {
    console.error('❌ Admin users API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
// export async function GET(request: NextRequest) {
//   // Get all pending reports
//   const reports = await prisma.userReport.findMany({
//     where: { status: 'PENDING' },
//     include: {
//       reporter: { select: { name: true, email: true } },
//       reportedUser: { select: { name: true, email: true } },
//       comment: { select: { content: true } }
//     },
//     orderBy: { createdAt: 'desc' }
//   });
  
//   return NextResponse.json({ success: true, data: reports });
// }

export async function PUT(request: NextRequest) {
  // Approve or reject a report
  const { reportId, status } = await request.json(); // status: 'APPROVED' | 'REJECTED'
  
  const report = await prisma.userReport.update({
    where: { id: reportId },
    data: { status }
  });
  
  return NextResponse.json({ success: true, data: report });
}