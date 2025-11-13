// src/app/api/customer/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getAuthToken, verifyJWT } from '@/lib/auth';
import prisma from '@/lib/db';

// Verify authenticated user (any role)
async function verifyAuthenticatedUser(request: NextRequest): Promise<{ 
  user?: { 
    id: string; 
    role: string;
    name?: string;
    email?: string;
  }; 
  error?: string; 
  status?: number;
}> {
  // Method 1: Check middleware headers (preferred)
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");
  const userName = request.headers.get("x-user-name");
  const userEmail = request.headers.get("x-user-email");

  if (userId && userRole) {
    return { 
      user: { 
        id: userId, 
        role: userRole,
        name: userName || undefined,
        email: userEmail || undefined
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

  // Verify user still exists in database
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: validation.payload.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return { error: "User not found", status: 404 };
    }

    return { 
      user: {
        id: user.id,
        role: user.role,
        name: user.name || undefined,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { error: "Failed to verify user", status: 500 };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated (any role)
    const authCheck = await verifyAuthenticatedUser(request);
    if (authCheck.error || !authCheck.user) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Authentication required" },
        { status: authCheck.status || 401 }
      );
    }

    // ✅ Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // ✅ Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // ✅ Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file extension' },
        { status: 400 }
      );
    }

    // ✅ Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    // ✅ Create date-based upload directory for better organization
    const now = new Date();
    const uploadsDir = join(
      process.cwd(),
      'public',
      'uploads',
      'profiles',
      `${now.getFullYear()}`,
      `${(now.getMonth() + 1).toString().padStart(2, '0')}`,
      `${now.getDate().toString().padStart(2, '0')}`
    );

    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      console.error('Could not create uploads directory:', err);
      return NextResponse.json(
        { success: false, error: 'Server error creating upload directory' },
        { status: 500 }
      );
    }

    // ✅ Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `profile-${authCheck.user.id}-${timestamp}-${randomId}.${fileExtension}`;
    const filePath = join(uploadsDir, filename);

    // ✅ Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      await writeFile(filePath, buffer);
    } catch (err) {
      console.error('Failed to write file:', err);
      return NextResponse.json(
        { success: false, error: 'Failed to save image' },
        { status: 500 }
      );
    }

    // ✅ Generate relative path for database
    const relativePath = `/uploads/profiles/${now.getFullYear()}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${filename}`;

    // ✅ Update user's image in database
    try {
      await prisma.user.update({
        where: { id: authCheck.user.id },
        data: { image: relativePath }
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to update profile in database' },
        { status: 500 }
      );
    }

    // ✅ Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: authCheck.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        contactNumber: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: relativePath,
        filename,
        size: file.size,
        type: file.type,
        user: updatedUser // ✅ Include full user object for auth context update
      },
      message: 'Profile image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}