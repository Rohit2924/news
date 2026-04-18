//api/admin/careers/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { verifyJWT } from '@/lib/auth';


/**
 * @swagger
 * /api/admin/careers/applications:
 *   get:
 *     summary: Get all job applications (Admin/Editor only)
 *     tags:
 *       - Careers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       resumeUrl:
 *                         type: string
 *                       message:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized / No or invalid token
 *       403:
 *         description: Forbidden / Insufficient role
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a specific job application by ID (Admin/Editor only)
 *     tags:
 *       - Careers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job application ID to delete
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       400:
 *         description: Missing ID parameter
 *       401:
 *         description: Unauthorized / No or invalid token
 *       403:
 *         description: Forbidden / Insufficient role
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */


function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7);
  return (
    request.cookies.get('adminAuthToken')?.value ||
    request.cookies.get('editorAuthToken')?.value ||
    request.cookies.get('auth-token')?.value ||
    null
  );
}

async function requireAdmin(request: NextRequest) {
  const token = getAuthToken(request);
  if (!token) return { error: 'No token provided', status: 401 } as const;
  const res = verifyJWT(token);
  if (!res.isValid || !res.payload) return { error: 'Invalid token', status: 401 } as const;
  if (res.payload.role !== 'ADMIN' && res.payload.role !== 'EDITOR') return { error: 'Unauthorized', status: 403 } as const;
  return { ok: true } as const;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const apps = await prisma.jobApplication.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, data: apps });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.jobApplication.delete({ where: { id } });
  return NextResponse.json({ success: true });
}


