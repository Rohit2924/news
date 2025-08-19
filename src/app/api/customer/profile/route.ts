import { NextResponse } from "next/server";
import prisma from "@/lib/models/prisma";
import { verifyJWT } from "@/lib/auth";

export async function GET(request: Request) {
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

    // Get user profile from database
    const users = await prisma.$queryRaw`
      SELECT id, email, name, role, image, "contactNumber", "createdAt", "updatedAt"
      FROM users WHERE id = ${payload.id}
    `;
    const user = Array.isArray(users) ? users[0] : null;

    if (!user) {
      return NextResponse.json(
        { error: true, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      error: false,
      data: user,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get request body
    const body = await request.json();
    const { name, contactNumber } = body;

    // Validate input
    if (!name?.trim()) {
      return NextResponse.json(
        { error: true, message: "Name is required" },
        { status: 400 }
      );
    }

    // Update user profile
    await prisma.$executeRaw`
      UPDATE users 
      SET name = ${name}, "contactNumber" = ${contactNumber || null}, "updatedAt" = NOW()
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
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
