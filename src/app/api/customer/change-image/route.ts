import { NextResponse } from "next/server";
import prisma from "@/lib/models/prisma";
import { verifyJWT } from "@/lib/auth";
import { uploadImage } from "@/lib/utils/upload";

export async function POST(request: Request) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: true, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: true, message: "Invalid token format" },
        { status: 401 }
      );
    }

    // Verify the token
    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: true, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Handle image upload
    const formData = await request.formData();
    const image = formData.get("image") as File;
    
    if (!image) {
      return NextResponse.json(
        { error: true, message: "No image provided" },
        { status: 400 }
      );
    }

    // Upload image and get the URL
    const imageUrl = await uploadImage(image, 'profiles');

    // Update user profile with new image
    await prisma.$executeRaw`
      UPDATE users 
      SET image = ${imageUrl}, "updatedAt" = NOW()
      WHERE id = ${payload.id}
    `;
    
    // Get updated user data
    const updatedUsers = await prisma.$queryRaw`
      SELECT id, email, name, role, image, "contactNumber", "createdAt", "updatedAt"
      FROM users WHERE id = ${payload.id}
    `;
    const updatedUser = Array.isArray(updatedUsers) ? updatedUsers[0] : null;

    return NextResponse.json({
      error: false,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile image update error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
