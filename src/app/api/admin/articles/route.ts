// src/app/api/admin/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { secureLog } from '@/lib/secure-logger';
import { AppError, ErrorCodes } from '@/lib/error-handler';
import { getAuthToken, verifyJWT } from '@/lib/auth';

// Verify admin or editor access from middleware headers or JWT token
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

// GET /api/admin/articles - Get all articles (with role-based filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Math.min(rawLimit, 50); // max 50
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(categoryId && { categoryId }),
      ...((startDate || endDate) && {
        published_date: {
          ...(startDate && { gte: new Date(startDate).toISOString().split('T')[0] }),
          ...(endDate && { lte: new Date(endDate).toISOString().split('T')[0] })
        }
      })
    };
    
    const orderBy = {
      [sortBy]: sortOrder
    };    
    
    // Auth check
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 401 }
      );
    }
    
    // Fetch articles (model is News)
    const [newsArticles, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          author: true,
          published_date: true,
          image: true,
          imageUrl: true,
          summary: true,
          content: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              comments: true
            }
          }
        }
      }),
      prisma.news.count({ where })
    ]);
    
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    
    return NextResponse.json({
      success: true, 
      data: {
        articles: newsArticles,
        pagination: { page, limit, total, totalPages, hasMore }
      }
    });
  } catch (error) {
    // SECURE ERROR LOGGING - No sensitive data
    secureLog.error('Failed to fetch articles', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Generic error response
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}


// POST /api/admin/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 401 }
      );
    }

    // Get user info to use as author
    const user = await prisma.user.findUnique({
      where: { id: authCheck.user!.id },
      select: { name: true, email: true }
    });

    const body = await request.json();
    const { 
      title, 
      content, 
      categoryId, 
      imageUrl, 
      summary, 
      image,
      tags,
      author,
      status = 'published',
      published_date
    } = body;

    // SECURE DEVELOPMENT LOGGING
    if (process.env.NODE_ENV === 'production') {
      console.log('Creating article with data:', { 
        titleLength: title?.length || 0,
        categoryId: categoryId ? 'provided' : 'missing',
        contentLength: content?.length || 0,
        tagsCount: Array.isArray(tags) ? tags.length : 0,
        status: status,
        hasPublishedDate: !!published_date
      });
    }
    
    // Input sanitization
    const sanitizedTitle = title?.trim().substring(0, 500) || '';
    const sanitizedContent = content?.trim().substring(0, 10000) || '';

    // Validate required fields for ALL articles (both draft and published)
    if (!sanitizedTitle || !sanitizedContent || !categoryId) {
      throw new AppError('Title, content, and category are required', ErrorCodes.MISSING_REQUIRED_FIELD, 400);
    }
    
    // Verify the category exists (required for all articles)
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new AppError('Category not found', ErrorCodes.RECORD_NOT_FOUND, 400);
    }
    
    // Handle published_date - for drafts it can be null, for published use provided or current date
    let finalPublishedDate: string | undefined = undefined;
    if (status === 'published') {
      finalPublishedDate = published_date 
        ? new Date(published_date).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];
    }
    
    // Create the article data object
    const articleData: any = {
      title: sanitizedTitle,
      content: sanitizedContent,
      categoryId: categoryId,
      imageUrl: imageUrl || '',
      image: image || '',
      summary: summary ? summary.trim().substring(0, 500) : (sanitizedContent ? sanitizedContent.substring(0, 200) + '...' : ''),
      author: author || user?.name || authCheck.user!.id,
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      status: status
    };

    // Only add published_date if it's not null/undefined
    if (finalPublishedDate) {
      articleData.published_date = finalPublishedDate;
    }
    
    const article = await prisma.news.create({
      data: articleData,
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
    
    // SECURE LOGGING - Fix the category access
    secureLog.api('Article created', true);
    secureLog.success('Article created details', {
      articleId: article.id,
      category: article.category?.name || 'Unknown category',
      status: status,
      action: status === 'draft' ? 'draft_save' : 'publish'
    });

    return NextResponse.json({
      success: true,
      data: article,
      message: status === 'draft' ? 'Draft saved successfully' : 'Article published successfully'
    }, { status: 201 });
    
  } catch (error) {
    // SECURE ERROR LOGGING
    secureLog.error('Failed to create article', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Handle AppError instances
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    // SECURE ERROR HANDLING
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles - Bulk update articles (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 401 }
      );
    }
    
    // Only ADMIN can perform bulk operations
    if (authCheck.user!.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required for bulk operations' },
        { status: 403 }
      );
    }
    
    const { action, articleIds, updateData } = await request.json();
    
    if (!action || !articleIds || !Array.isArray(articleIds)) {
      return NextResponse.json(
        { success: false, error: 'Action and articleIds are required' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'delete':
        result = await prisma.news.deleteMany({
          where: { id: { in: articleIds } }
        });
        break;
        
      case 'update':
        if (!updateData) {
          return NextResponse.json(
            { success: false, error: 'Update data is required' },
            { status: 400 }
          );
        }
        
        // If categoryId is being updated, verify it exists
        if (updateData.categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: updateData.categoryId }
          });
          
          if (!category) {
            return NextResponse.json(
              { success: false, error: 'Invalid category' },
              { status: 400 }
            );
          }
        }
        
        result = await prisma.news.updateMany({
          where: { id: { in: articleIds } },
          data: updateData
        });
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    secureLog.api(`Bulk ${action} operation completed`, true);
    secureLog.success(`Bulk ${action} details`, {
      action,
      affectedCount: result.count
    });
    
    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed`,
      data: { affected: result.count }
    });
    
  } catch (error) {
    secureLog.error('Failed to perform bulk operation', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles - Delete all articles (Admin only - dangerous)
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 401 }
      );
    }
    
    // Only ADMIN can delete all articles
    if (authCheck.user!.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Get confirmation from query parameters
    const url = new URL(request.url);
    const confirm = url.searchParams.get('confirm');
    
    if (confirm !== 'true') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Confirmation required. Add ?confirm=true to delete all articles',
          warning: 'This action cannot be undone'
        },
        { status: 400 }
      );
    }
    
    // Delete all articles
    const result = await prisma.news.deleteMany({});
    
    secureLog.api('All articles deleted', true);
    secureLog.success('Articles deletion details', {
      deletedCount: result.count
    });
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} articles`,
      data: { deleted: result.count }
    });
    
  } catch (error) {
    secureLog.error('Failed to delete all articles', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete articles' },
      { status: 500 }
    );
  }
}