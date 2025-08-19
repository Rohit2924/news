import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';

// GET /api/articles/subcategories?category=business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ success: false, error: 'category is required' }, { status: 400 });
    }

    // Group by subcategory for given category
    const groups = await prisma.news.groupBy({
      by: ['subcategory'],
      where: { category: { equals: category, mode: 'insensitive' } },
      _count: { subcategory: true },
    });
    
    // Normalize, remove nulls, sort by count desc
    
    const subcategories = groups
      .filter(g => !!g.subcategory)
      .sort((a, b) => (b._count.subcategory ?? 0) - (a._count.subcategory ?? 0))
      .map(g => ({ name: g.subcategory as string, count: g._count.subcategory || 0 }));

    return NextResponse.json({ success: true, subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
