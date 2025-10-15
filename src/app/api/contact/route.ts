import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 415 });
    }

    const body = await request.json();
    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const message = (body.message || '').toString().trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const saved = await prisma.contactMessage.create({
      data: { name, email, message },
    });

    return NextResponse.json({ success: true, data: { id: saved.id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to submit message', details: error?.message }, { status: 500 });
  }
}


