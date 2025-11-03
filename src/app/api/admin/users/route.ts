// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { JWTPayload } from '@/lib/types/auth';
import { getAuthToken, verifyJWT } from '@/lib/auth';


async function verifyAdminAccess(request: Request): Promise<{ user?: JWTPayload; error?: string; status?: number }> {
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

if(userId && userRole){
  if(userRole !== 'ADMIN'){
    return{
      error: "Admin access required", status:403
    };
  }
  
  const user: JWTPayload = {
    id: userId,
    email: request.headers.get("x-user-email") || '',
    name: request.headers.get("x-user-name") || undefined,
    role: 'ADMIN',
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

  if (validation.payload.role !== 'ADMIN') {
    return { error: "Admin access required", status: 403 };
  }

  // Verify user still exists in database
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: validation.payload.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { error: "Admin access required", status: 403 };
    }

    return { user: validation.payload };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { error: "Failed to verify user", status: 500 };
  }
}

// GET /api/admin/users - List all users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, totalPages, hasMore }
      }
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await verifyAdminAccess(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: true, message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { email, name, password, role, contactNumber } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: true, message: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: true, message: 'Email already in use' },
        { status: 409 }
      );
    }

    // Hash password (use bcrypt in production)
    // For now, storing as plain text - DO NOT USE IN PRODUCTION
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password, // In production: await bcrypt.hash(password, 10)
        role: role || 'USER',
        contactNumber: contactNumber || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        contactNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}