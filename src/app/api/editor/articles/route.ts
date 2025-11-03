// src/app/api/editor/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { secureLog } from '@/lib/secure-logger';
import { AppError, ErrorCodes, handleApiError } from '@/lib/error-handler';

// Use middleware headers for authentication (same as admin routes)
async function verifyEditorAccess(request: Request): Promise<{ 
  user?: { id: string; role: string; name: string }; 
  error?: string; 
  status?: number 
}> {
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  console.log("🔍 Editor Access Check - Headers:", { userId, userRole });

  if (!userId) {
    return { error: "Authentication required", status: 401 };
  }

  if (userRole !== 'EDITOR' && userRole !== 'ADMIN') {
    return { error: "Editor or Admin access required", status: 403 };
  }

  // Get user details from database for name
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true }
  });

  return { 
    user: { 
      id: userId, 
      role: userRole,
      name: user?.name || 'Editor User'
    } 
  };
}

export async function GET(request: NextRequest) {
  try {
    const authCheck = await verifyEditorAccess(request);
    
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }
    
    const articles = await prisma.news.findMany({
      where: { author: authCheck.user?.name }, // FIXED: Use authCheck.user.name
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { comments: true } } }
    });
    
    secureLog.api('Fetched articles by editor', true);
    return NextResponse.json(articles);
  } catch (error) {
    secureLog.error('Failed to fetch articles', error);
    return handleApiError(error);
  }
}



export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyEditorAccess(request); // FIXED: Renamed from payload
    
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }
    
    const body = await request.json();
    const { title, content, categoryId, imageUrl, summary, image } = body; // Changed to categoryId
    
    // Validate input
    if (!title || !content || !categoryId) {
      throw new AppError('Title, content, and category are required', ErrorCodes.MISSING_REQUIRED_FIELD, 400);
    }
    
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      throw new AppError('Category not found', ErrorCodes.RECORD_NOT_FOUND, 400);
    }
    
    // Create the article with ALL required fields
    const article = await prisma.news.create({
      data: {
        title,
        content,
        categoryId, 
        imageUrl: imageUrl || '',
        image: image || 'https://via.placeholder.com/800x400?text=News+Article',
        published_date: new Date().toISOString().split('T')[0],
        summary: summary || content.substring(0, 200) + '...',
        author: authCheck.user?.name || "" 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    
    secureLog.api('Created new article', true);
    return NextResponse.json({ 
      success: true, 
      data: article,
      message: 'Article created successfully'
    }, { status: 201 });
  } catch (error) {
    secureLog.error('Failed to create article', error);
    return handleApiError(error);
  }
}

