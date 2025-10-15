// src/app/api/editor/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import prisma  from '@/lib/models/prisma';
import { secureLog } from '@/lib/secure-logger';
import { AppError, ErrorCodes, handleApiError } from '@/lib/error-handler';

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return request.cookies.get('authToken')?.value || null;
}

type EditorPayload = { id: string; email: string; role: string; name: string };

async function verifyEditorAccess(request: NextRequest): Promise<EditorPayload> {
  const token = getAuthToken(request);
  if (!token) {
    throw new AppError('No token provided', ErrorCodes.AUTH_REQUIRED, 401);
  }
  
  const result = verifyJWT(token);
  if (!result.isValid || !result.payload) {
    throw new AppError('Invalid token', ErrorCodes.INVALID_TOKEN, 401);
  }
  
  if (result.payload.role !== 'EDITOR' && result.payload.role !== 'ADMIN') {
    throw new AppError('Unauthorized', ErrorCodes.INSUFFICIENT_PERMISSIONS, 403);
  }
  
  const authorName = (result.payload as any).name || result.payload.email.split('@')[0];
  return { id: result.payload.id, email: result.payload.email, role: result.payload.role, name: authorName };
}

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyEditorAccess(request);
    
    const articles = await prisma.news.findMany({
      where: { author: payload.name },
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

// src/app/api/editor/articles/route.ts
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyEditorAccess(request);
    
    const body = await request.json();
    const { title, content, category, imageUrl, summary, image } = body; // Add image to destructuring
    
    // Validate input
    if (!title || !content) {
      throw new AppError('Title and content are required', ErrorCodes.MISSING_REQUIRED_FIELD, 400);
    }
    
    // Create the article with ALL required fields
    const article = await prisma.news.create({
      data: {
        title,
        content,
        category: category || 'general',
        imageUrl: imageUrl || '', // This is your imageUrl field
        image: image || 'https://via.placeholder.com/800x400?text=News+Article', // REQUIRED: image field
        published_date: new Date().toISOString().split('T')[0], // REQUIRED: published_date field
        summary: summary || content.substring(0, 200) + '...',
        author: payload.name
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