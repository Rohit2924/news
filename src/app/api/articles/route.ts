import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/lib/models/prisma';

// GET /api/articles - Get all articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10))) : undefined;

    let whereClause: any = {};
    if (category) {
      whereClause.category = { equals: category, mode: 'insensitive' };
    }
    if (subcategory) {
      whereClause.subcategory = { equals: subcategory, mode: 'insensitive' };
    }

    const articles = await prisma.news.findMany({
      where: whereClause,
      orderBy: [
        { published_date: 'desc' },
        { id: 'desc' }
      ],
      take: limit
    });

    return NextResponse.json({ success: true, articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// POST /api/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, subcategory, author, published_date, image, summary, content, tags } = body;
    
    if (!title || !category || !author || !published_date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const article = await prisma.news.create({
      data: {
        title,
        category,
        subcategory: subcategory || null,
        author,
        published_date,
        image: image || '',
        summary: summary || '',
        content: content || '',
        tags: tags || []
      }
    });

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
