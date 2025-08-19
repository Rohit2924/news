// // app/api/news/route.ts
// import { PrismaClient } from '@prisma/client'
// import { NextResponse } from 'next/server'

// const prisma = new PrismaClient()

// export async function GET() {
//   const news = await prisma.news.findMany()
//   return NextResponse.json(news)
// }

// export async function POST(req: Request) {
//   const body = await req.json()
//   const newNews = await prisma.news.create({
//     data: {
//       title: body.title,
//       summary: body.summary,
//       content: body.content,
//     },
//   })
//   return NextResponse.json(newNews)
// }
