import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/models/prisma";

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/comments - Get all comments (with pagination and filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const newsId = searchParams.get("newsId");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (newsId) where.newsId = parseInt(newsId);
    if (userId) where.userId = userId;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          news: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, newsId } = body;

    if (!content || !newsId) {
      return NextResponse.json(
        { error: "Content and newsId are required" },
        { status: 400 }
      );
    }

    // Verify the news article exists
    const news = await prisma.news.findUnique({
      where: { id: parseInt(newsId) },
    });

    if (!news) {
      return NextResponse.json(
        { error: "News article not found" },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: user.id,
        newsId: parseInt(newsId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        news: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}