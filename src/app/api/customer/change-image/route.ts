import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import prisma from '@/lib/models/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header or httpOnly cookie
    const authHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1] || null;
    }
    if (!token) {
      token = request.cookies.get('authToken')?.value ?? null;
    }
    if (!token) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    // Verify token
    const tokenResult = verifyJWT(token);
    if (!tokenResult.isValid || !tokenResult.payload) {
      return NextResponse.json({ error: true, message: 'Invalid or expired token.' }, { status: 401 });
    }
    const payload = tokenResult.payload;

    // ✅ Parse form data
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    if (!image) {
      return NextResponse.json({ success: false, error: 'No image provided.' }, { status: 400 });
    }

    // ✅ Validate file type and extension
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type.' }, { status: 400 });
    }
    const fileExtension = image.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return NextResponse.json({ success: false, error: 'Invalid file extension.' }, { status: 400 });
    }

    // ✅ Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (image.size > maxSize) {
      return NextResponse.json({ success: false, error: 'File size must be less than 5MB.' }, { status: 400 });
    }

    // ✅ Create date-based upload directory
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
      return NextResponse.json({ success: false, error: 'Server error creating upload directory.' }, { status: 500 });
    }

    // ✅ Generate unique filename and save file
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomId}.${fileExtension}`;
    const filePath = join(uploadsDir, filename);
    const buffer = Buffer.from(await image.arrayBuffer());

    try {
      await writeFile(filePath, buffer);
    } catch (err) {
      console.error('Failed to write file:', err);
      return NextResponse.json({ error: true, message: 'Failed to save image.' }, { status: 500 });
    }

    // ✅ Update user profile in database
    const relativePath = `/uploads/profiles/${now.getFullYear()}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${filename}`;
    try {
      await prisma.user.update({
        where: { id: payload.id },
        data: { image: relativePath },
      });
    } catch (err) {
      console.error('Database update failed:', err);
      return NextResponse.json({ error: true, message: 'Failed to update profile.' }, { status: 500 });
    }

    // Get updated user data to return
    const updatedUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      }
    });

    // Return success response with updated user data
    return NextResponse.json({
      error: false,
      data: {
        image: relativePath,
        user: updatedUser // Include full user object for auth context update
      },
    });
  } catch (error) {
    console.error('Profile image update error:', error);
    return NextResponse.json({
      error: true,
      message: error instanceof Error ? error.message : 'Unexpected server error.',
    }, { status: 500 });
  }
}
