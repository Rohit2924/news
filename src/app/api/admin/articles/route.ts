// src/app/api/admin/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import prisma from '@/lib/models/prisma';
import { secureLog } from '@/lib/secure-logger';
import { AppError, ErrorCodes } from '@/lib/error-handler';

interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface TokenValidationResult {
  isValid: boolean;
  payload?: JWTPayload;
}

function getAuthToken(request: NextRequest): string | null {
  // First, check the x-auth-token header (set by middleware)
  const xAuthToken = request.headers.get('x-auth-token');
  if (xAuthToken) {
    return xAuthToken;
  }
  
  // Then, check the Authorization header with Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Finally, check cookies for all three token types with priority
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    // Check tokens in priority order: admin > editor > user
    if (cookies.adminAuthToken) {
      return cookies.adminAuthToken;
    }
    if (cookies.editorAuthToken) {
      return cookies.editorAuthToken;
    }
    if (cookies.authToken) {
      return cookies.authToken;
    }
  }
  
  return null;
}

async function verifyAdminAccess(request: NextRequest): Promise<JWTPayload> {
  const token = getAuthToken(request);
  if (!token) {
    throw new AppError('No token provided', ErrorCodes.AUTH_REQUIRED, 401);
  }

  const result = verifyJWT(token);
  if (!result.isValid || !result.payload) {
    throw new AppError('Invalid token', ErrorCodes.INVALID_TOKEN, 401);
  }

  if (result.payload.role !== 'ADMIN') {
    throw new AppError('Admin access required', ErrorCodes.INSUFFICIENT_PERMISSIONS, 403);
  }

  return result.payload as JWTPayload;
}

// GET /api/admin/articles - Get all articles (with role-based filtering)
export async function GET(request: NextRequest) {
  try {
    // Pagination and search support
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    
    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(categoryId && { categoryId })
    };
    
    // Auth check
    const admin = await verifyAdminAccess(request);
    
    // Fetch articles (model is News)
    const [newsArticles, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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
      error: false,
      data: {
        articles: newsArticles,
        pagination: { page, limit, total, totalPages, hasMore }
      }
    });
  } catch (error) {
    secureLog.error('Failed to fetch articles', error);
    
    // Handle AppError instances
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/admin/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAdminAccess(request);
    
    const body = await request.json();
    const { 
      title, 
      content, 
      categoryId, 
      imageUrl, 
      summary, 
      image,
      tags 
    } = body;
    
    // Validate required fields
    if (!title || !content || !categoryId) {
      throw new AppError('Title, content, and category are required', ErrorCodes.MISSING_REQUIRED_FIELD, 400);
    }
    
    // Verify the category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    

    // Create the article with all required fields
    const article = await prisma.news.create({
      data: {
        title,
        content,
        categoryId,
        imageUrl: imageUrl || '',
        image: image || 'https://via.placeholder.com/800x400?text=News+Article',
        published_date: new Date().toISOString().split('T')[0],
        summary: summary || content.substring(0, 200) + '...',
        author: payload.name,
        tags: Array.isArray(tags) ? tags : []
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
    
    // Handle AppError instances
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'Article with this title already exists' },
          { status: 409 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 400 }
        );
      }
    }
    

    
    // Handle other errors
    console.error('Create article error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles - Bulk update articles (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const payload = await verifyAdminAccess(request);
    
    // Only ADMIN can perform bulk operations
    if (payload.role !== 'ADMIN') {
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
    
    secureLog.api(`Bulk ${action} articles`, true);
    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed`,
      data: { affected: result.count }
    });
    
  } catch (error) {
    secureLog.error(`Failed to bulk ${request.json().then(body => body.action)} articles`, error);
    
    // Handle AppError instances
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    // Handle other errors
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles - Delete all articles (Admin only - dangerous)
export async function DELETE(request: NextRequest) {
  try {
    const payload = await verifyAdminAccess(request);
    
    // Only ADMIN can delete all articles
    if (payload.role !== 'ADMIN') {
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
    
    secureLog.api('Deleted all articles', true);
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} articles`,
      data: { deleted: result.count }
    });
    
  } catch (error) {
    secureLog.error('Failed to delete all articles', error);
    
    // Handle AppError instances
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    // Handle other errors
    console.error('Delete all articles error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete articles' },
      { status: 500 }
    );
  }
}