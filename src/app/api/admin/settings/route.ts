// api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getAuthToken } from '@/lib/auth';
import prisma from '@/lib/models/prisma';
import fs from 'fs';
import path from 'path';

// Simple logger for production
const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'production') {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[ERROR] ${message}`, error || '');
    }
  }
};

// Ensure Node.js runtime so fs is available
export const runtime = 'nodejs';

async function verifyAdminAccess(request: NextRequest): Promise<{ user?: any; error?: string; status?: number }> {
  // Method 1: Check middleware headers (preferred)
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  if (userId && userRole) {
    // Allow both ADMIN and EDITOR roles to access settings
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return { error: "Admin or Editor access required", status: 403 };
    }

    return { 
      user: {
        id: userId,
        email: request.headers.get("x-user-email") || '',
        role: userRole,
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

  // Allow both ADMIN and EDITOR roles to access settings
  if (validation.payload.role !== 'ADMIN' && validation.payload.role !== 'EDITOR') {
    return { error: "Admin or Editor access required", status: 403 };
  }

  // Verify user still exists in database
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
    logger.error('Error verifying user:', error);
    return { error: "Failed to verify user", status: 500 };
  }
}

export async function GET(request: NextRequest) {
  try {
    logger.info('GET request received for settings');
    
    const authResult = await verifyAdminAccess(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    // Test database connection
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
    } catch (dbError) {
      logger.error('Database connection failed', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Get or create site settings
    let settings = await prisma.siteSettings.findFirst();
    logger.info('Settings found', { hasSettings: !!settings });
    
    if (!settings) {
      logger.info('Creating default settings');
      settings = await prisma.siteSettings.create({
        data: {
          siteName: "News Portal",
          siteDescription: "Your trusted source for news",
          siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
          metaTitle: "News Portal - Latest News",
          metaDescription: "Stay updated with the latest news",
          metaKeywords: "news, portal, latest, updates",
          footerText: "© 2024 News Portal. All rights reserved."
        }
      });
      logger.info('Default settings created', { id: settings.id });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    logger.error('Get settings error', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}



export async function PUT(request: NextRequest) {
  try {
    logger.info('PUT request received for settings');
    
    const authResult = await verifyAdminAccess(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    // Decide between JSON and multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.toLowerCase().includes('multipart/form-data');

    let body: any = {};
    let uploadedFilePaths: Record<string, string> = {};

    if (isMultipart) {
      const formData = await request.formData();

      // Handle known file fields if present
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileFields = ['siteLogoFile', 'siteFaviconFile'];
      for (const key of fileFields) {
        const file = formData.get(key) as File | null;
        if (file && typeof file !== 'string') {
          const arrayBuf = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          const safeName = `${Date.now()}-${(file as File).name}`.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const destPath = path.join(uploadDir, safeName);
          fs.writeFileSync(destPath, buffer);
          uploadedFilePaths[key] = `/uploads/${safeName}`;
        }
      }

      // Collect text fields
      formData.forEach((value, key) => {
        if (!fileFields.includes(key)) {
          body[key] = value;
        }
      });

      logger.info('Multipart form parsed', { fields: Object.keys(body), files: Object.keys(uploadedFilePaths) });
    } else {
      body = await request.json();
      logger.info('Request body received', { body });
    }

    // Find the existing settings record.
    const existingSettings = await prisma.siteSettings.findFirst();
    if (!existingSettings) {
      return NextResponse.json({ 
        error: 'Configuration Error', 
        details: 'Site settings not found in the database. Please load the settings page first.' 
      }, { status: 404 });
    }

    // Define fields that should NOT be updated directly
    const readOnlyFields = ['id', 'createdAt', 'updatedAt'];

    // Prepare the data for Prisma, filtering out undefined and read-only fields
    const dataToUpdate: any = {};
    for (const key in body) {
      if (!readOnlyFields.includes(key) && body[key] !== undefined) {
        if (key === 'footerLinks') {
          continue;
        }
        // Allow clearing with empty string => null, otherwise set value
        dataToUpdate[key] = body[key] === '' ? null : body[key];
      }
    }

    // Special handling for the `footerLinks` JSON field
    if (body.footerLinks !== undefined) {
      if (body.footerLinks === '' || body.footerLinks === null) {
        // Clear the field
        dataToUpdate.footerLinks = null;
      } else {
        try {
          // Ensure it's a valid JSON object. If it's already an object, use it as is.
          dataToUpdate.footerLinks = typeof body.footerLinks === 'string' 
            ? JSON.parse(body.footerLinks) 
            : body.footerLinks;
        } catch (e) {
          logger.error('Invalid JSON provided for footerLinks', { value: body.footerLinks });
          return NextResponse.json({ 
            error: 'Validation Error', 
            details: 'The footerLinks field must be a valid JSON object.' 
          }, { status: 400 });
        }
      }
    }

    // Map uploaded files to DB columns
    if (uploadedFilePaths.siteLogoFile) {
      dataToUpdate.siteLogo = uploadedFilePaths.siteLogoFile;
    }
    if (uploadedFilePaths.siteFaviconFile) {
      dataToUpdate.siteFavicon = uploadedFilePaths.siteFaviconFile;
    }
    
    logger.info('Final data prepared for Prisma update', { dataToUpdate });

    // Perform the update
    const updatedSettings = await prisma.siteSettings.update({
      where: { id: existingSettings.id },
      data: dataToUpdate,
    });

    logger.info('Settings updated successfully', { id: updatedSettings.id });

    return NextResponse.json({ 
      success: true, 
      data: updatedSettings,
      message: 'Settings updated successfully' 
    });

  } catch (error: any) {
    logger.error('Update settings error', error);
    
    // Catch Prisma-specific errors and provide a clean message
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Failed to update settings',
        details: 'A unique constraint would be violated on the database. This might be a duplicate URL or another unique field.'
      }, { status: 400 });
    }
    
    // For all other errors, return the generic message with the original error details
    return NextResponse.json({ 
      error: 'Failed to update settings',
      details: error.message 
    }, { status: 500 });
  }
}