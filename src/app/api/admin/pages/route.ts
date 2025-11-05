// src/app/api/admin/pages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { JWTPayload } from '@/lib/types/auth';
import { getAuthToken, verifyJWT } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function verifyAdminAccess(request: Request): Promise<{ user?: JWTPayload; error?: string; status?: number }> {
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  // Method 1: Use headers set by middleware (preferred)
  if (userId && userRole) {
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return {
        error: "Admin or Editor access required", 
        status: 403
      };
    }
    
    const user: JWTPayload = {
      id: userId,
      email: request.headers.get("x-user-email") || '',
      name: request.headers.get("x-user-name") || undefined,
      role: userRole as 'ADMIN' | 'EDITOR' | 'USER',
    };
    
    return { user };
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

  // Verify user still exists in database (now that Prisma is working)
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: validation.payload.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return { error: "Admin or Editor access required", status: 403 };
    }

    return { user: validation.payload };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { error: "Failed to verify user", status: 500 };
  }
}

// GET /api/admin/pages - List all pages
export async function GET(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    // Fetch pages from database (now that Prisma is working)
    const pages = await prisma.pageContent.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    console.log('✅ Successfully fetched pages from database');
    return NextResponse.json({
      success: true,
      data: pages
    });

  } catch (error) {
    console.error('Pages fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST /api/admin/pages - Create a new page
export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.pageSlug || !body.pageTitle || !body.pageContent) {
      return NextResponse.json(
        { success: false, error: 'Page slug, title, and content are required' },
        { status: 400 }
      );
    }

    // Check if page already exists
    const existingPage = await prisma.pageContent.findUnique({
      where: { pageSlug: body.pageSlug }
    });

    if (existingPage) {
      return NextResponse.json(
        { success: false, error: 'Page with this slug already exists' },
        { status: 409 }
      );
    }

    const page = await prisma.pageContent.create({
      data: {
        pageSlug: body.pageSlug,
        pageTitle: body.pageTitle,
        pageContent: body.pageContent,
        metaTitle: body.metaTitle || body.pageTitle,
        metaDescription: body.metaDescription || '',
        metaKeywords: body.metaKeywords || '',
        isActive: body.isActive !== false
      }
    });

    console.log('✅ Successfully created page:', page.pageSlug);
    return NextResponse.json({ 
      success: true, 
      data: page,
      message: 'Page created successfully' 
    });
  } catch (error) {
    console.error('Create page error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create page' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/pages - Update a page
export async function PUT(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Check if page exists
    const existingPage = await prisma.pageContent.findUnique({
      where: { id: body.id }
    });

    if (!existingPage) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    const page = await prisma.pageContent.update({
      where: { id: body.id },
      data: {
        pageTitle: body.pageTitle,
        pageContent: body.pageContent,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords,
        isActive: body.isActive
      }
    });

    console.log('✅ Successfully updated page:', page.pageSlug);
    return NextResponse.json({ 
      success: true, 
      data: page,
      message: 'Page updated successfully' 
    });
  } catch (error) {
    console.error('Update page error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pages - Delete a page
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Check if page exists
    const existingPage = await prisma.pageContent.findUnique({
      where: { id }
    });

    if (!existingPage) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    await prisma.pageContent.delete({
      where: { id }
    });

    console.log('✅ Successfully deleted page:', id);
    return NextResponse.json({ 
      success: true,
      message: 'Page deleted successfully' 
    });
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}