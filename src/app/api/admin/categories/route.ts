// src/app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthToken, verifyJWT } from "@/lib/auth";


/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories (Admin only)
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search categories by name
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           description:
 *                             type: string
 *                           parent:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           subcategories:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                           _count:
 *                             type: object
 *                             properties:
 *                               articles:
 *                                 type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *       401:
 *         description: Unauthorized / No token
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name (min 2 characters)
 *               description:
 *                 type: string
 *                 description: Optional description
 *               parentId:
 *                 type: string
 *                 description: Optional parent category ID
 *     responses:
 *       200:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         slug:
 *                           type: string
 *                         description:
 *                           type: string
 *                         parentId:
 *                           type: string
 *       400:
 *         description: Validation error or duplicate category
 *       401:
 *         description: Unauthorized / No token
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */


// Schema for creating/updating a category
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

// Verify admin access from middleware headers
async function verifyAdminAccess(request: Request): Promise<{ user?: any; error?: string; status?: number }> {
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");
    console.log("🔍 Admin Access Check - Role:", userRole);


  if(userId && userRole){
    if(userRole !== 'ADMIN'){
      return{
        error: "Admin access required", status:403
      };
    }
    return{

      user:   {
        id: userId,
        email: request.headers.get("x-user-email") || '',
        role: 'ADMIN',
      }
      };
    }
    const token = getAuthToken(request);

    if (!token) {
    return { error: "No authentication token found", status: 401 };
  }

  const validation = verifyJWT(token);
  if (!validation.isValid || !validation.payload) {
    return { 
      error: validation.error || "Invalid or expired token", 
      status: 401 
    };
  }

  if (validation.payload.role !== 'ADMIN') {
    return { error: "Admin access required", status: 403 };
  }

  // Verify user still exists in database
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: validation.payload.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { error: "Admin access required", status: 403 };
    }

    return { user: validation.payload };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { error: "Failed to verify user", status: 500 };
  }
}

// GET /api/admin/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';

    const where = search.trim()
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : undefined;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          parent: true,
          subcategories: true,
          _count: {
            select: { articles: true },
          },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: {
        categories,
        pagination: { page, limit, total, totalPages, hasMore },
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    // Create slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for duplicate slug
    const existingCategory = await prisma.category.findFirst({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // If parentId is provided, verify it exists
    if (validatedData.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: "Parent category not found" },
          { status: 400 }
        );
      }
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        parentId: validatedData.parentId,
      },
    });

    return NextResponse.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || "Validation error",
        },
        { status: 400 }
      );
    }

    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}