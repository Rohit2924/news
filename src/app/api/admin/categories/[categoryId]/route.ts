import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Schema for updating a category
const updateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

// Verify admin access from middleware headers
async function verifyAdminAccess(request: Request): Promise<{ 
  user?: any; 
  error?: string; 
  status?: number 
}> {
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  console.log("🔍 Admin Access Check:", { userId, userRole });

  if (!userId) {
    return { error: "Authentication required", status: 401 };
  }

  if (userRole !== 'ADMIN') {
    return { error: "Admin access required", status: 403 };
  }

  return { user: { id: userId, role: userRole } };
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    // Use middleware-based authentication instead of getAdminSession
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { categoryId } = params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            articles: true,
            subcategories: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has articles or subcategories
    if (category._count.articles > 0 || category._count.subcategories > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category with existing articles or subcategories",
        },
        { status: 400 }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    // Use middleware-based authentication
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { categoryId } = params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // If name is being updated, create new slug and check for duplicates
    let slug;
    if (validatedData.name) {
      slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existingCategory = await prisma.category.findFirst({
        where: {
          slug,
          NOT: { id: categoryId },
        },
      });

      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: "Category with this name already exists" },
          { status: 400 }
        );
      }
    }

    // If parentId is provided, verify it exists and prevent circular references
    if (validatedData.parentId) {
      // Check if parent exists
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: "Parent category not found" },
          { status: 400 }
        );
      }

      // Prevent setting parent to self
      if (validatedData.parentId === categoryId) {
        return NextResponse.json(
          { success: false, error: "Category cannot be its own parent" },
          { status: 400 }
        );
      }

      // Check for circular reference
      let currentParent = parentCategory;
      while (currentParent.parentId) {
        if (currentParent.parentId === categoryId) {
          return NextResponse.json(
            { success: false, error: "Circular reference detected" },
            { status: 400 }
          );
        }
        const nextParent = await prisma.category.findUnique({
          where: { id: currentParent.parentId },
        });
        if (!nextParent) break;
        currentParent = nextParent;
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(validatedData.name && { name: validatedData.name, slug }),
        ...(validatedData.description && { description: validatedData.description }),
        parentId: validatedData.parentId,
      },
    });

    return NextResponse.json({
      success: true,
      data: { category: updatedCategory },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}