import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 415 });
    }

    const formData = await request.formData();
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const position = String(formData.get('position') || '').trim();
    const coverNote = String(formData.get('coverNote') || '').trim();
    const cv = formData.get('cv') as File | null;

    if (!name || !email || !position || !cv || typeof cv === 'string') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const arrayBuf = await cv.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const safeName = `${Date.now()}-${cv.name}`.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const destPath = path.join(uploadDir, safeName);
    fs.writeFileSync(destPath, buffer);
    const cvPath = `/uploads/cvs/${safeName}`;

    const saved = await prisma.jobApplication.create({
      data: { name, email, phone: phone || null, position, coverNote: coverNote || null, cvPath },
    });

    return NextResponse.json({ success: true, data: { id: saved.id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to submit application', details: error?.message }, { status: 500 });
  }
}


