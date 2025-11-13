import { NextResponse } from "next/server";
import prisma from "@/lib/models/prisma";
import { verifyJWT } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Get the token from the Authorization header or httpOnly cookie
    const authHeader = request.headers.get("Authorization");
    let token: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1] || null;
    }
    // cookie extraction works in server runtime APIs via Request.cookies
    if (!token) {
      try {
        token = (request as any).cookies?.get?.('auth-token')?.value ?? null;
      } catch (e) {
        // ignore
      }
    }

    if (!token) {
      return NextResponse.json({ error: true, message: "No token provided" }, { status: 401 });
    }

    // Verify the token
    const result = verifyJWT(token);
    if (!result.isValid || !result.payload) {
      return NextResponse.json(
        { error: true, message: "Invalid token" },
        { status: 401 }
      );
    }

    const users = await prisma.$queryRaw`
      SELECT id, email, name, role, image, "contactNumber", "createdAt", "updatedAt"
      FROM users WHERE id = ${result.payload.id}
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
    // Get the token from the Authorization header or httpOnly cookie
    const authHeader = request.headers.get("Authorization");
    let token: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1] || null;
    }
    if (!token) {
      try {
        // @ts-ignore
        token = (request as any).cookies?.get?.('auth-token')?.value ?? null;
      } catch (e) {}
    }
    if (!token) {
      return NextResponse.json({ error: true, message: "No token provided" }, { status: 401 });
    }

    // Verify the token
    const result = verifyJWT(token);
    if (!result.isValid || !result.payload) {
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
      WHERE id = ${result.payload.id}
    `;
    
    // Get updated user data
    const updatedUsers = await prisma.$queryRaw`
      SELECT id, email, name, role, image, "contactNumber", "createdAt", "updatedAt"
      FROM users WHERE id = ${result.payload.id}
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

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    let token: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1] || null;
    }
    if (!token) {
      try {
        token = (request as any).cookies?.get?.('auth-token')?.value ?? null;
      } catch (e) {}
    }
    if (!token) {
      return NextResponse.json({ error: true, message: 'No token provided' }, { status: 401 });
    }

    const result = verifyJWT(token);
    if (!result.isValid || !result.payload) {
      return NextResponse.json(
        { error: true, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Prevent admins from deleting via self-service
    const users = await prisma.$queryRaw`
      SELECT id, role FROM users WHERE id = ${result.payload.id}
    `;
    const me: any = Array.isArray(users) ? users[0] : null;
    if (!me) {
      return NextResponse.json(
        { error: true, message: "User not found" },
        { status: 404 }
      );
    }
    if (me.role === 'ADMIN') {
      return NextResponse.json(
        { error: true, message: "Admins cannot self-delete. Contact support." },
        { status: 403 }
      );
    }

    // Build a safe transactional deletion of dependent records.
    const userId = result.payload.id;

    // Prevent admins from deleting via self-service (already checked above by role), but re-check
    const dbMe = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!dbMe) {
      return NextResponse.json({ error: true, message: 'User not found' }, { status: 404 });
    }
    if ((dbMe as any).role === 'ADMIN') {
      return NextResponse.json({ error: true, message: 'Admins cannot self-delete. Contact support.' }, { status: 403 });
    }

    try {
      // Gather comment IDs authored by the user to clean up comment-related records referencing those comments
      const userComments = await prisma.comment.findMany({ where: { userId }, select: { id: true } });
      const commentIds = userComments.map((c) => c.id);

      // Run a transaction to remove dependent rows in a safe order
      await prisma.$transaction([
        // Remove comment edits authored by this user or edits that belong to comments by this user
        prisma.commentEdit.deleteMany({ where: { OR: [{ userId }, { commentId: { in: commentIds.length ? commentIds : [-1] } }] } }),
        // Remove user reports where this user is reporter or reported, or reports attached to comments by this user
        prisma.userReport.deleteMany({ where: { OR: [{ reporterId: userId }, { reportedUserId: userId }, { commentId: { in: commentIds.length ? commentIds : [-1] } }] } }),
        // Remove analytics events tied to the user
        prisma.analyticsEvent.deleteMany({ where: { userId } }),
        // Remove media files uploaded by the user
        prisma.mediaFile.deleteMany({ where: { uploadedBy: userId } }),
        // Remove comments authored by the user (after comment edits & reports cleaned up)
        prisma.comment.deleteMany({ where: { userId } }),
        // Finally remove the user
        prisma.user.delete({ where: { id: userId } }),
      ]);

      const response = NextResponse.json({ error: false, message: 'Account deleted' });
      // Clear auth cookie if any
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      return response;
    } catch (err) {
      console.error('Transactional delete failed:', err);
      return NextResponse.json({ error: true, message: 'Failed to delete account. Please contact support.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Profile delete error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}