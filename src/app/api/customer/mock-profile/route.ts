import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

// Mock profile endpoint that doesn't require database
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

    // Mock user data based on token payload
    const mockUsers: { [key: string]: any } = {
      'user_1': {
        id: 'user_1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        image: null,
        contactNumber: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'user_2': {
        id: 'user_2',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        image: null,
        contactNumber: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'user_3': {
        id: 'user_3',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user',
        image: null,
        contactNumber: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    const user = mockUsers[payload.id];

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
    console.error("Mock profile fetch error:", error);
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

    // Mock updated user data
    const updatedUser = {
      id: payload.id,
      email: payload.email,
      name: name,
      role: 'user',
      image: null,
      contactNumber: contactNumber || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      error: false,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Mock profile update error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}