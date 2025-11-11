// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/models/prisma';

// export async function GET(request: NextRequest) {
//   try {
//     console.log('Testing database connection...');
    
//     // Test basic connection
//     await prisma.$connect();
    
//     // Test query
//     const userCount = await prisma.user.count();
//     const newsCount = await prisma.news.count();
    
//     // Get database info
//     const result = await prisma.$queryRaw`SELECT version() as postgres_version, current_database() as database_name`;
    
//     return NextResponse.json({
//       success: true,
//       message: 'Database connection successful!',
//       data: {
//         connected: true,
//         user_count: userCount,
//         news_count: newsCount,
//         database_info: result,
//         timestamp: new Date().toISOString()
//       }
//     });
    
//   } catch (error) {
//     console.error('Database connection test failed:', error);
//     return NextResponse.json({
//       success: false,
//       message: 'Database connection failed',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // your prisma client

export async function GET() {
  try {
    // Simple query to check connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ status: 'connected', message: 'Prisma is connected to the database ✅' });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ status: 'error', message: 'Prisma failed to connect ❌', error: String(error) }, { status: 500 });
  }
}
