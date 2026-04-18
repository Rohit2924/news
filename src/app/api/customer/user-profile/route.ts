// src/app/api/customer/profile/route.ts 
import { NextResponse } from "next/server";
import prisma from '@/lib/models/prisma';

/**
 * @swagger
 * tags:
 *   - name: CustomerProfile
 *     description: Endpoints for fetching authenticated customer profile and comments
 */

/**
 * @swagger
 * /api/customer/profile:
 *   get:
 *     summary: Get authenticated customer profile with comments
 *     tags:
 *       - CustomerProfile
 *     description: Fetches the authenticated user's profile and all comments made by them, including news information.
 *     security:
 *       - x-user-id: []
 *       - x-user-role: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
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
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
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
 *                             format: date-time
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
 *         description: Authentication required / User ID not found
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */



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