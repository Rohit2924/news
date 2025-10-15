import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { secureLog } from '@/lib/secure-logger';

const logger = secureLog;

export async function GET(request: NextRequest) {
  try {
    logger.info('GET request received for public site settings');
    
    // Test database connection
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
    } catch (dbError) {
      logger.error('Database connection failed', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Get site settings (public endpoint, no auth required)
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
    logger.error('Get public site settings error', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
