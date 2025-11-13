// api/cvs/[cv_uploads]/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import prisma from "@/lib/models/prisma";
import { getAuthToken, verifyJWT } from "@/lib/auth";


// this verify admin or Editor Access 
export async function verifyAdminAccess(request: NextRequest): Promise<{ 
  user?: { 
    id: string; 
    role: string;
    name?: string;
  }; 
  error?: string; 
  status?: number;
}> {
     // Method 1: Check middleware headers (preferred)
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  if (userId && userRole) {
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return { error: "Admin or Editor access required", status: 403 };
    }

    return { 
      user: { 
        id: userId, 
        role: userRole,
        name: request.headers.get("x-user-name") || undefined
      } 
    };
  }

  // Method 2: Fallback - verify JWT token directly from cookies/headers
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

  if (validation.payload.role !== 'ADMIN' && validation.payload.role !== 'EDITOR') {
    return { error: "Admin or Editor access required", status: 403 };
  }

  // Verify user still exists in database
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: validation.payload.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return { error: "Admin or Editor access required", status: 403 };
    }

    return { 
      user: {
        id: validation.payload.id,
        role: validation.payload.role,
        name: validation.payload.name
      }
    };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { error: "Failed to verify user", status: 500 };
  }
}

export async function GET(
    request: NextRequest,
     {params }: {params: {cv_uploads: string}}
){
    try{
        const authCheck = await verifyAdminAccess(request);
        if(authCheck.error){
            return NextResponse.json(
                {success: false, error: authCheck.error},
                {status: authCheck.status || 401}
            );
        }

      // validation filename
      const filename = params.cv_uploads;
      if(!filename || !/^[a-zA-Z0-9._-]+$/.test(filename)){
        return NextResponse.json(
         { success: false, error: "Invalid filename" },
        { status: 400 }
      );
    }

    // Locate file
    const filePath = path.join(process.cwd(), "private_uploads", "cvs", filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "CV file not found" },
        { status: 404 }
      );
    }

    // Read and Serve
    const fileBuffer = fs.readFileSync(filePath);
    const fileExtension = path.extname(filename).toLowerCase();

    const contentTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentTypes[fileExtension] || "application/octet-stream",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("CV download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download CV" },
      { status: 500 }
    );
  }
}