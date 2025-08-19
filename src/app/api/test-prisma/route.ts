import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';

// GET /api/test-prisma - Test Prisma client and News table
export async function GET(request: NextRequest) {
  try {
    console.log('Testing Prisma client and News table...');
    
    // Test basic Prisma connection
    const newsCount = await prisma.news.count();
    
    // Get a sample article
    const sampleArticle = await prisma.news.findFirst({
      select: {
        id: true,
        title: true,
        category: true,
        author: true,
        createdAt: true
      }
    });
    
    // Test category query
    const categories = await prisma.news.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Prisma client and News table working correctly!',
      data: {
        total_articles: newsCount,
        sample_article: sampleArticle,
        categories: categories,
        prisma_status: 'Connected and operational'
      }
    });
    
  } catch (error) {
    console.error('Prisma test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Prisma test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/test-prisma - Test creating a test article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'create_test') {
      // Create a test article
      const testArticle = await prisma.news.create({
        data: {
          title: 'Test Article - Prisma Test',
          category: 'test',
          subcategory: 'prisma-test',
          author: 'System Test',
          published_date: new Date().toISOString().split('T')[0],
          image: 'https://via.placeholder.com/400x300',
          summary: 'This is a test article to verify Prisma functionality',
          content: '<p>Test content for Prisma verification</p>',
          tags: ['test', 'prisma', 'verification']
        }
      });
      
      // Clean up - delete the test article
      await prisma.news.delete({
        where: { id: testArticle.id }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Test article created and deleted successfully',
        data: {
          test_article_id: testArticle.id,
          operation: 'create_and_delete_test'
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use "create_test" to test CRUD operations'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Prisma POST test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Prisma POST test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
