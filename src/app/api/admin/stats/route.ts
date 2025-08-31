import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/models/prisma";

// Helper function to verify JWT token and admin role
function verifyAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    
    if (decoded.role !== "admin") {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = verifyAdminToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Get current date for time-based calculations
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all statistics in parallel
    const [
      totalUsers,
      totalNews,
      totalComments,
      newUsersThisMonth,
      newCommentsThisWeek,
      recentComments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.news.count(),
      prisma.comment.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonth,
          },
        },
      }),
      prisma.comment.count({
        where: {
          createdAt: {
            gte: lastWeek,
          },
        },
      }),
      prisma.comment.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          news: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    // Calculate growth rates (mock calculation for now)
    const userGrowthRate = newUsersThisMonth > 0 ? ((newUsersThisMonth / Math.max(totalUsers - newUsersThisMonth, 1)) * 100).toFixed(1) : "0";
    const commentGrowthRate = newCommentsThisWeek > 0 ? ((newCommentsThisWeek / Math.max(totalComments - newCommentsThisWeek, 1)) * 100).toFixed(1) : "0";

    const stats = {
      totalUsers,
      totalNews,
      totalComments,
      newUsersThisMonth,
      newCommentsThisWeek,
      userGrowthRate: `+${userGrowthRate}%`,
      commentGrowthRate: `+${commentGrowthRate}%`,
      recentComments,
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}