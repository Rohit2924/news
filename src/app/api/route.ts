// app/api/news/route.ts
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const news = await prisma.news.findMany()
  return NextResponse.json(news)
}

export async function POST(req: Request) {
  const body = await req.json()
  const newNews = await prisma.news.create({
        data: {
        title: body.title,
        summary: body.summary,
        content: body.content,
        category: body.category,
        author: body.author,
        published_date: body.published_date,
        image: body.image,
        imageUrl: body.imageUrl || body.image,
        tags: body.tags,
        },
  })
  http://localhost:3000/api/auth/me

  return NextResponse.json(newNews)
}

