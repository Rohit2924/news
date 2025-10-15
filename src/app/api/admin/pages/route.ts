// import { NextRequest, NextResponse } from 'next/server';
// import { verifyJWT } from '@/lib/jwt';
// import prisma from '@/lib/models/prisma';

// function getAuthToken(request: NextRequest): string | null {
//   const authHeader = request.headers.get('authorization');
//   if (authHeader && authHeader.startsWith('Bearer ')) {
//     return authHeader.substring(7);
//   }
//   return request.cookies.get('authToken')?.value || null;
// }

// async function verifyAdminAccess(request: NextRequest) {
//   const token = getAuthToken(request);
//   if (!token) {
//     return { error: 'No token provided', status: 401 };
//   }

//   const payload = verifyJWT(token);
//   if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'EDITOR')) {
//     return { error: 'Unauthorized', status: 403 };
//   }

//   return { payload };
// }

// export async function GET(request: NextRequest) {
//   try {
//     const authResult = await verifyAdminAccess(request);
//     if (authResult.error) {
//       return NextResponse.json({ error: authResult.error }, { status: authResult.status });
//     }

//     const pages = await prisma.pageContent.findMany({
//       orderBy: { createdAt: 'desc' }
//     });

//     return NextResponse.json({ success: true, data: pages });
//   } catch (error) {
//     console.error('Get pages error:', error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const authResult = await verifyAdminAccess(request);
//     if (authResult.error) {
//       return NextResponse.json({ error: authResult.error }, { status: authResult.status });
//     }

//     const body = await request.json();
    
//     // Validate required fields
//     if (!body.pageSlug || !body.pageTitle || !body.pageContent) {
//       return NextResponse.json(
//         { error: 'Page slug, title, and content are required' },
//         { status: 400 }
//       );
//     }

//     // Check if page already exists
//     const existingPage = await prisma.pageContent.findUnique({
//       where: { pageSlug: body.pageSlug }
//     });

//     if (existingPage) {
//       return NextResponse.json(
//         { error: 'Page with this slug already exists' },
//         { status: 409 }
//       );
//     }

//     const page = await prisma.pageContent.create({
//       data: {
//         pageSlug: body.pageSlug,
//         pageTitle: body.pageTitle,
//         pageContent: body.pageContent,
//         metaTitle: body.metaTitle || body.pageTitle,
//         metaDescription: body.metaDescription || '',
//         metaKeywords: body.metaKeywords || '',
//         isActive: body.isActive !== false
//       }
//     });

//     return NextResponse.json({ 
//       success: true, 
//       data: page,
//       message: 'Page created successfully' 
//     });
//   } catch (error) {
//     console.error('Create page error:', error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const authResult = await verifyAdminAccess(request);
//     if (authResult.error) {
//       return NextResponse.json({ error: authResult.error }, { status: authResult.status });
//     }

//     const body = await request.json();
    
//     if (!body.id) {
//       return NextResponse.json(
//         { error: 'Page ID is required' },
//         { status: 400 }
//       );
//     }

//     const page = await prisma.pageContent.update({
//       where: { id: body.id },
//       data: {
//         pageTitle: body.pageTitle,
//         pageContent: body.pageContent,
//         metaTitle: body.metaTitle,
//         metaDescription: body.metaDescription,
//         metaKeywords: body.metaKeywords,
//         isActive: body.isActive
//       }
//     });

//     return NextResponse.json({ 
//       success: true, 
//       data: page,
//       message: 'Page updated successfully' 
//     });
//   } catch (error) {
//     console.error('Update page error:', error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const authResult = await verifyAdminAccess(request);
//     if (authResult.error) {
//       return NextResponse.json({ error: authResult.error }, { status: authResult.status });
//     }

//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
    
//     if (!id) {
//       return NextResponse.json(
//         { error: 'Page ID is required' },
//         { status: 400 }
//       );
//     }

//     await prisma.pageContent.delete({
//       where: { id }
//     });

//     return NextResponse.json({ 
//       success: true,
//       message: 'Page deleted successfully' 
//     });
//   } catch (error) {
//     console.error('Delete page error:', error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }