import { NextResponse } from 'next/server';
import {
  createNews,
  getNews,
} from '@/lib/models/article';

export async function GET() {
  const news = await getNews();
  return NextResponse.json(news);
}

export async function POST(req: Request) {
  const data = await req.json();
  const news = await createNews(data);
  return NextResponse.json(news);
}
