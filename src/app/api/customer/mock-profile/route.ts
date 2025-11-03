// src/app/api/customer/profile/route.ts (REAL version)
import { NextResponse } from "next/server";
import prisma from '@/lib/models/prisma';

async function verifyUserAccess(request: Request): Promise<{ 
  user?: { id: string; role: string; name: string; email: string }; 
  error?: string; 
  status?: number 
}> {
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");
  const userEmail = request.headers.get("x-user-email");

  if (!userId) {
    return { error: "Authentication required", status: 401 };
  }

  return { 
    user: { 
      id: userId, 
      role: userRole || 'user',
      name: 'User', 
      email: userEmail || ''
    } 
  };
}

export async function GET(request: Request) {
  try {
    const authCheck = await verifyUserAccess(request);
    
    if (authCheck.error) {
      return NextResponse.json(
        { error: true, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const userId = authCheck.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: true, message: "User ID not found" },
        { status: 401 }
      );
    }

    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        contactNumber: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: true, message: "User not found" },
        { status: 404 }
      );
    }

    // comments form database
    const comments = await prisma.comment.findMany({
      where: { userId: userId },
      include: {
        news: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      error: false, 
      data: {
        ...user,
        comments
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}