import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/articles/subcategories?category=politics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'category is required' }, 
        { status: 400 }
      );
    }

    // Find category by name to get its ID
    const categoryRecord = await prisma.category.findFirst({
      where: { 
        name: { 
          equals: category, 
          mode: 'insensitive' 
        } 
      }
    });

    if (!categoryRecord) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get subcategories for this category
    const subcategories = await prisma.category.findMany({
      where: { 
        parentId: categoryRecord.id 
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: subcategories 
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}