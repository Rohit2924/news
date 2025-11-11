import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/auth";

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

  