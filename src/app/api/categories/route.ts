import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Endpoints for fetching categories and their metadata
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Categories
 *     description: Returns a list of all categories, including subcategory count and article count.
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1234abcd"
 *                       name:
 *                         type: string
 *                         example: "Politics"
 *                       slug:
 *                         type: string
 *                         example: "politics"
 *                       description:
 *                         type: string
 *                         example: "All political news and updates"
 *                       parentId:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       _count:
 *                         type: object
 *                         properties:
 *                           articles:
 *                             type: integer
 *                             example: 42
 *                           subcategories:
 *                             type: integer
 *                             example: 3
 *       500:
 *         description: Failed to fetch categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch categories"
 */


export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        _count: {
          select: {
            articles: true,
            subcategories: true,
          },
        },
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}