// src/app/api/admin/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { getAuthToken, verifyJWT } from '@/lib/auth';

// Use the SAME verifyAdminAccess function as your main route
async function verifyAdminAccess(request: NextRequest): Promise<{ 
  user?: { 
    id: string; 
    role: string;
    name?: string;
  }; 
  error?: string; 
  status?: number;
}> {
  // Method 1: Check middleware headers (preferred)
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  if (userId && userRole) {
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return { error: "Admin or Editor access required", status: 403 };
    }

    return { 
      user: { 
        id: userId, 
        role: userRole,
        name: request.headers.get("x-user-name") || undefined
      } 
    };
  }

  // Method 2: Fallback - verify JWT token directly from cookies/headers
  const token = getAuthToken(request);
  if (!token) {
    return { error: "No authentication token found", status: 401 };
  }

  const validation = verifyJWT(token);
  if (!validation.isValid || !validation.payload) {
    return { 
      error: validation.error || "Invalid or expired token", 
      status: 401 
    };
  }

  if (validation.payload.role !== 'ADMIN' && validation.payload.role !== 'EDITOR') {
    return { error: "Admin or Editor access required", status: 403 };
  }

  // Verify user still exists in database
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: validation.payload.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return { error: "Admin or Editor access required", status: 403 };
    }

    return { 
      user: {
        id: validation.payload.id,
        role: validation.payload.role,
        name: validation.payload.name
      }
    };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { error: "Failed to verify user", status: 500 };
  }
}

// GET /api/admin/articles/[id] - Get specific article
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    
    if (isNaN(articleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid article ID' },
        { status: 400 }
      );
    }
    
    // Use the SAME auth function as main route
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 401 }
      );
    }
    
    const article = await prisma.news.findUnique({
      where: { id: articleId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });
    
    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }
    
    console.log('📥 [BACKEND GET] Article data:', {
      id: article.id,
      categoryId: article.categoryId,
      category: article.category
    });
    
    return NextResponse.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update the PUT handler in your backend API
// PUT /api/admin/articles/[id] - Update article
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    
    if (isNaN(articleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid article ID' },
        { status: 400 }
      );
    }
    
    // Use the SAME auth function as main route
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 401 }
      );
    }
    
    const body = await request.json();
    const { 
      title, 
      categoryId, 
      author, 
      published_date, 
      image, 
      imageUrl,
      summary, 
      content, 
      tags 
    } = body;
    
    console.log('📥 [BACKEND] Received update data:', body);
    console.log('📥 [BACKEND] CategoryId type:', typeof categoryId, 'value:', categoryId);
    
    // Validate required fields
    if (!title || !categoryId || !author || !content) {
      return NextResponse.json(
        { success: false, error: 'Title, category, author, and content are required' },
        { status: 400 }
      );
    }
    
    // Verify the category exists - use string ID directly
    const category = await prisma.category.findUnique({
      where: { id: categoryId } // Use as string, no parsing needed
    });
    
    console.log('📥 [BACKEND] Found category:', category);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }
    
    const updatedArticle = await prisma.news.update({
      where: { id: articleId },
      data: {
        title,
        categoryId: categoryId, // Store as string
        author,
        published_date: published_date || new Date().toISOString().split('T')[0],
        image: image ||  '',
        imageUrl: image || imageUrl || '',
        summary: summary || '',
        content,
        tags: Array.isArray(tags) ? tags : [],
        updatedAt: new Date()
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
    
    return NextResponse.json({
      success: true,
      message: 'Article updated successfully',
      data: updatedArticle
    });
  } catch (error) {
    console.error('Error updating article:', error);
    
    // Type-safe error checking
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Article not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    
    if (isNaN(articleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid article ID' },
        { status: 400 }
      );
    }
    
    // Use the SAME auth function as main route
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 401 }
      );
    }
    
    await prisma.news.delete({
      where: { id: articleId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    
    // Type-safe error checking
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Article not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}