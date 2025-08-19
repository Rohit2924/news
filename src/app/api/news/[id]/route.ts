import { NextResponse } from 'next/server';
import {
  getNewsById,
  updateNews,
  deleteNews,
} from '@/lib/models/article';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const news = await getNewsById(id);
  return NextResponse.json(news);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const data = await req.json();
  const news = await updateNews(id, data);
  return NextResponse.json(news);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await deleteNews(id);
  return NextResponse.json({ success: true });
}
