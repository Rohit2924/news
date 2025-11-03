import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/models/prisma";
import { AppError, ErrorCodes, handleApiError } from "@/lib/error-handler";
import type { JWTPayload } from "@/lib/types/auth";

export const runtime = "nodejs";

// Helper: verify JWT from cookies

async function verifyEditorOrAdminAccess(request: Request): Promise<{ user?: JWTPayload; error?: string; status?: number }> {
  // --- TEMPORARY DEBUG LOGGING ---
  console.log("ARTICLES API: All received headers:", request.headers);
  const userId = request.headers.get("x-user-id");
  console.log("ARTICLES API: x-user-id header found:", userId);
  // --- END TEMPORARY LOGGING ---

  if (!userId) {
    return { error: "Authentication required", status: 401 };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return { error: "User not found", status: 401 };
    }

    if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
      return { error: "Admin or Editor access required", status: 403 };
    }

  return { 
    user: {
      ...user,
      name: user.name || undefined 
    } 
  };

  } catch (error) {
    console.error("Error verifying editor access:", error);
    return { error: "Could not verify user", status: 500 };
  }
}

// GET /api/articles?category=...&subcategory=...&limit=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10))) : 20;
    
    const whereClause: any = {};
    if (category) whereClause.category = {is:{ name: {equals: category, mode: "insensitive"}} };
    if (subcategory) whereClause.subcategory ={ is:{ name: {equals: category, mode: "insensitive"}} };
    
    const articles = await prisma.news.findMany({
      where: whereClause,
      orderBy: [
        { published_date: "desc" },
        { id: "desc" }
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        category: true,
        // subcategory: true,
        author: true,
        published_date: true,
        image: true,
        imageUrl: true,
        summary: true,
        content: true,
        tags: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return NextResponse.json({ success: true, articles });
  } catch (error: unknown) {
    console.error("Error fetching articles:", error);
    
    if (error instanceof AppError) {
      return handleApiError(error);
    }
    
    // Handle Prisma errors
    if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string' && error.code.startsWith('P')) {
      const appError = new AppError(
        "Database error occurred while fetching articles",
        ErrorCodes.DB_QUERY_FAILED,
        500
      );
      return handleApiError(appError);
    }
    
    // Generic error handling
    const appError = new AppError(
      "Failed to fetch articles",
      ErrorCodes.INTERNAL_SERVER_ERROR,
      500
    );
    return handleApiError(appError);
  }
}

// POST /api/articles
export async function POST(req: NextRequest) {
const authCheck = await verifyEditorOrAdminAccess(req);
if (authCheck.error) {
  return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
}
  
  try {
    const body = await req.json();
    const { title, categoryId,author, published_date, image, imageUrl, summary, content, tags } = body;
    
    if (!title || !categoryId || !author || !published_date) {
      throw new AppError(
        "Missing required fields",
        ErrorCodes.MISSING_REQUIRED_FIELD,
        400,
        { missingFields: ['title', 'category', 'author', 'published_date'].filter(field => !eval(field)) }
      );
    }
    
    // Store both image and imageUrl fields
    const article = await prisma.news.create({
      data: {
        title,
        categoryId,
        // subcategory: subcategory || null,
        author,
        published_date,
        image: image || "", // Use image field directly
        imageUrl: imageUrl || "", // Use imageUrl field directly
        summary: summary || "",
        content: content || "",
        tags: tags || []
      }
    });
    
    console.log("Article created successfully:", article.id);
    
    return NextResponse.json({ success: true, article });
  } catch (error: unknown) {
    console.error("Error creating article:", error);
    
    if (error instanceof AppError) {
      return handleApiError(error);
    }
    
    // Handle Prisma errors
    if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string' && error.code.startsWith('P')) {
      const appError = new AppError(
        "Database error occurred while creating article",
        ErrorCodes.DB_QUERY_FAILED,
        500
      );
      return handleApiError(appError);
    }
    
    // Generic error handling
    const appError = new AppError(
      "Failed to create article",
      ErrorCodes.INTERNAL_SERVER_ERROR,
      500
    );
    return handleApiError(appError);
  }
}