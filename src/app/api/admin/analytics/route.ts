// src/app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get analytics overview
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics overview
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
 *                     totalViews:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 *                     popularArticles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           category:
 *                             type: string
 *                           views:
 *                             type: integer
 *       500:
 *         description: Failed to fetch analytics
 */


export async function GET(request: NextRequest) {
  try {
    // Get total page views (example: sum of AnalyticsEvent)
    const totalViews = await prisma.analyticsEvent.count();
    // Get unique users (example: distinct userId in AnalyticsEvent)
    const totalUsers = await prisma.analyticsEvent.findMany({
      distinct: ["userId"],
      where: { userId: { not: null } },
    });
    // Get most popular articles by views (example: count AnalyticsEvent by newsId)
    const popularArticlesRaw = await prisma.analyticsEvent.groupBy({
      by: ["metadata"],
      _count: { metadata: true },
    });
    // Fallback: get atop 5 articles by comment count
    const popularArticles = await prisma.news.findMany({
      orderBy: { comments: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        title: true,
        category: {
          select: { name: true }
        },
        comments: true,
      },
    });
    return NextResponse.json({
      success: true,
      data: {
        totalViews,
        totalUsers: totalUsers.length,
        popularArticles: popularArticles?.map((a, i) => ({
          id: a.id,
          title: a.title,
          category: a.category?.name || "N/A",
          views: a.comments.length,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}
