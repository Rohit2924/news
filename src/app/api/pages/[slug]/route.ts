 // src/app/api/pages/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';


/**
 * @swagger
 * tags:
 *   - name: Pages
 *     description: Static CMS pages
 */

/**
 * @swagger
 * /api/pages/{slug}:
 *   get:
 *     summary: Get page content by slug
 *     description: Fetch a public CMS page using its slug. Only active pages are returned.
 *     tags:
 *       - Pages
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique page slug (e.g., "about-us", "privacy-policy")
 *     responses:
 *       200:
 *         description: Page content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clt9u3f8g002edp9x1o8i8k7f"
 *                     pageSlug:
 *                       type: string
 *                       example: "about-us"
 *                     pageTitle:
 *                       type: string
 *                       example: "About Our Company"
 *                     pageContent:
 *                       type: string
 *                       example: "<p>Welcome to our site.</p>"
 *                     metaTitle:
 *                       type: string
 *                       example: "About Us - MySite"
 *                     metaDescription:
 *                       type: string
 *                       example: "Learn more about our company."
 *                     metaKeywords:
 *                       type: string
 *                       example: "about us, company, info"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Slug missing or invalid
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
 *                   example: Page slug is required
 *       404:
 *         description: Page not found
 *       500:
 *         description: Internal server error
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
 *                   example: Failed to fetch page
 */



// GET /api/pages/[slug] - Get page content by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } =  await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Page slug is required' },
        { status: 400 }
      );
    }

    // Find the page by slug
    const page = await prisma.pageContent.findUnique({
      where: { 
        pageSlug: slug,
        isActive: true 
      },
      select: {
        id: true,
        pageSlug: true,
        pageTitle: true,
        pageContent: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page
    });

  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

  