 // src/app/api/pages/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';

// GET /api/pages/[slug] - Get page content by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } =  await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Page slug is required' },
        { status: 400 }
      );
    }

    // Find the page by slug
    const page = await prisma.pageContent.findUnique({
      where: { 
        pageSlug: slug,
        isActive: true 
      },
      select: {
        id: true,
        pageSlug: true,
        pageTitle: true,
        pageContent: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page
    });

  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

  