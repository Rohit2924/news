// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/models/db'; // Assuming this is your PostgreSQL client

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM posts');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;

    const result = await pool.query(
      'INSERT INTO posts (title, content, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [title, content]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
