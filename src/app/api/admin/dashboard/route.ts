import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/auth";

/**
 * @swagger
 * tags:
 *   - name: Admin Dashboard
 *     description: Admin dashboard overview and analytics
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard overview
 *     tags:
 *       - Admin Dashboard
 *     responses:
 *       200:
 *         description: Successfully fetched dashboard data
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                           example: 120
 *                         totalNews:
 *                           type: integer
 *                           example: 45
 *                         totalComments:
 *                           type: integer
 *                           example: 300
 *                     analytics:
 *                       type: object
 *                       description: Placeholder for analytics data
 *                       additionalProperties: true
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user is not an admin)
 *       500:
 *         description: Internal server error
 */


export async function GET(request: NextRequest) {
  console.log("🔍 [AdminDashboard] Incoming GET request to /api/admin/dashboard");



    const allHeaders = Object.fromEntries(request.headers.entries());
    console.log("📋 [AdminDashboard] Request headers:", allHeaders);

    const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const result = verifyJWT(token);

  if (!result.isValid || !result.payload) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }

  const userRole = result.payload.role;
  if (userRole !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }

  const totalUsers = await prisma.user.count();
  const totalNews = await prisma.news.count();
  const totalComments = await prisma.comment.count();

  return NextResponse.json({
    success: true,
    data: {
      overview: { totalUsers, totalNews, totalComments },
      analytics: {} // add whatever you need
    }
    
  })};

  