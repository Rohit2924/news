// api/customer/mock-profile/route.ts
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import * as cookie from "cookie";

// Fixed: Updated type definitions to allow null for contactNumber
interface MockUser {
  id: string;
  email: string;
  name: string;
  role: string;
  image: string;
  contactNumber: string | null; // Changed from string to string | null
  createdAt: string;
  updatedAt: string;
}

interface MockComment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  newsId: string;
}

interface MockNews {
  id: string;
  title: string;
  category: string;
}

// Mock user database - in a real app, this would be your actual database
const mockUsers: MockUser[] = [
  {
    id: "1",
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    contactNumber: "+1234567890",
    createdAt: new Date("2023-01-15").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    contactNumber: "+0987654321",
    createdAt: new Date("2023-02-20").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    email: "editor@example.com",
    name: "Editor User",
    role: "editor",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    contactNumber: "+1122334455",
    createdAt: new Date("2023-03-10").toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Mock comments data
const mockComments: MockComment[] = [
  {
    id: "1",
    content: "Great article! Very informative.",
    createdAt: new Date("2023-06-15").toISOString(),
    userId: "1",
    newsId: "1",
  },
  {
    id: "2",
    content: "I have a different perspective on this topic.",
    createdAt: new Date("2023-06-16").toISOString(),
    userId: "2",
    newsId: "2",
  },
  {
    id: "3",
    content: "Thanks for sharing this information.",
    createdAt: new Date("2023-06-17").toISOString(),
    userId: "3",
    newsId: "1",
  }
];

// Mock news data
const mockNews: MockNews[] = [
  {
    id: "1",
    title: "Breaking News: Important Event",
    category: "Politics",
  },
  {
    id: "2",
    title: "Technology Advances in 2023",
    category: "Technology",
  }
];

function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1] || null;
  }
  const cookies = request.headers.get("cookie") || "";
  const parsed = cookie.parse(cookies);
  return parsed.authToken || null;
}

// Helper function to simulate database delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to get user by ID or email
function getUserByIdentifier(identifier: string): MockUser | undefined {
  return mockUsers.find(user => 
    user.id === identifier || user.email === identifier
  );
}

// Helper function to get comments by user ID
function getCommentsByUserId(userId: string): (MockComment & { news?: MockNews })[] {
  return mockComments
    .filter(comment => comment.userId === userId)
    .map(comment => ({
      ...comment,
      news: mockNews.find(news => news.id === comment.newsId)
    }));
}

// Helper function to extract user identifier from token payload
function extractUserId(payload: any): string | null {
  // Log the entire payload for debugging
  console.log("Full token payload:", JSON.stringify(payload, null, 2));
  
  // Check for direct properties
  const directIds = {
    id: payload.id,
    email: payload.email,
    sub: payload.sub,
    userId: payload.userId,
    user_id: payload.user_id,
    username: payload.username,
    name: payload.name
  };
  
  console.log("Direct identifiers:", directIds);
  
  // Check for nested properties (common in JWT structures)
  const nestedIds = {
    user_id: payload.user?.id,
    user_email: payload.user?.email,
    user_sub: payload.user?.sub,
    user_userId: payload.user?.userId,
    user_user_id: payload.user?.user_id,
    user_username: payload.user?.username,
    user_name: payload.user?.name,
    data_id: payload.data?.id,
    data_email: payload.data?.email,
    data_sub: payload.data?.sub,
    data_userId: payload.data?.userId,
    data_user_id: payload.data?.user_id,
    data_username: payload.data?.username,
    data_name: payload.data?.name
  };
  
  console.log("Nested identifiers:", nestedIds);
  
  // Combine all possible identifiers
  const allPossibleIds = [
    ...Object.values(directIds),
    ...Object.values(nestedIds)
  ];
  
  // Find the first non-null identifier
  for (const id of allPossibleIds) {
    if (id) {
      console.log("Found identifier:", id);
      return id;
    }
  }
  
  return null;
}

// Profile endpoint uses mock data; accepts Bearer or cookie
export async function GET(request: Request) {
  try {
    // Simulate network delay for realism
    await delay(300);
    
    // Log the entire request for debugging
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    const token = extractToken(request);
    console.log("Extracted token:", token ? `${token.substring(0, 20)}...` : "null");
    
    if (!token) {
      return NextResponse.json(
        { error: true, message: "No token provided" },
        { status: 401 }
      );
    }
    
    const result = verifyJWT(token);
    console.log("Token verification result:", result);
    
    if (!result.isValid || !result.payload) {
      return NextResponse.json(
        { error: true, message: result.error || "Invalid token" },
        { status: 401 }
      );
    }
    
    const payload = result.payload;
    const userId = payload.id; // Now we can directly use payload.id
    console.log("Final extracted user ID:", userId);
    
    if (!userId) {
      // For debugging, return detailed information about the payload
      return NextResponse.json(
        { 
          error: true, 
          message: "Token payload missing user identifier",
          debug: {
            payloadType: typeof payload,
            payloadKeys: Object.keys(payload),
            payload: payload,
            tokenPreview: token.substring(0, 20) + "..."
          }
        },
        { status: 401 }
      );
    }

    // Add logging for debugging
    console.log(`Fetching profile for user identifier: ${userId}`);
    
    // Find user in mock database
    const user = getUserByIdentifier(userId);
    
    if (!user) {
      // If user not found, create a new user based on token payload
      const tokenPayload = payload as any; // Cast to any to access properties
      const newUser: MockUser = {
        id: tokenPayload.id || tokenPayload.user?.id || tokenPayload.data?.id || Date.now().toString(),
        email: tokenPayload.email || tokenPayload.user?.email || tokenPayload.data?.email || userId,
        name: tokenPayload.name || tokenPayload.username || tokenPayload.user?.name || tokenPayload.user?.username || tokenPayload.data?.name || tokenPayload.data?.username || "New User",
        role: tokenPayload.role || tokenPayload.user?.role || tokenPayload.data?.role || "user",
        image: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
        contactNumber: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add to mock users
      mockUsers.push(newUser);
      
      // Get comments for the new user (will be empty initially)
      const comments = getCommentsByUserId(newUser.id);
      
      console.log("Created new user:", {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      });

      return NextResponse.json({ 
        error: false, 
        data: {
          ...newUser,
          comments
        }
      });
    }
    
    // Get user's comments
    const comments = getCommentsByUserId(user.id);
    
    // Log the fetched user data for debugging
    console.log("Fetched user data:", {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      commentsCount: comments.length
    });

    return NextResponse.json({ 
      error: false, 
      data: {
        ...user,
        comments
      }
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
    // Simulate network delay for realism
    await delay(300);
    
    // Log the entire request for debugging
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    const token = extractToken(request);
    console.log("Extracted token:", token ? `${token.substring(0, 20)}...` : "null");
    
    if (!token) {
      return NextResponse.json(
        { error: true, message: "No token provided" },
        { status: 401 }
      );
    }
    
    const result = verifyJWT(token);
    console.log("Token verification result:", result);
    
    if (!result.isValid || !result.payload) {
      return NextResponse.json(
        { error: true, message: result.error || "Invalid token" },
        { status: 401 }
      );
    }
    
    const payload = result.payload;
    const userId = payload.id;
    console.log("Final extracted user ID:", userId);
    
    if (!userId) {
      // For debugging, return detailed information about the payload
      return NextResponse.json(
        { 
          error: true, 
          message: "Token payload missing user identifier",
          debug: {
            payloadType: typeof payload,
            payloadKeys: Object.keys(payload),
            payload: payload,
            tokenPreview: token.substring(0, 20) + "..."
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, contactNumber, email } = body as { 
      name?: string; 
      contactNumber?: string | null; 
      email?: string 
    };

    // Optional: validate email format if provided
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { error: true, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Find user in mock database
    const userIndex = mockUsers.findIndex(u => 
      u.id === userId || u.email === userId
    );
    
    if (userIndex === -1) {
      // Create a new mock user based on token payload if not found
      const tokenPayload = payload as any;
      const newUser: MockUser = {
        id: tokenPayload.id || tokenPayload.user?.id || tokenPayload.data?.id || Date.now().toString(),
        email: (typeof email === 'string' && email) || tokenPayload.email || tokenPayload.user?.email || tokenPayload.data?.email || `${userId}@example.com`,
        name: typeof name === 'string' ? name : (tokenPayload.name || tokenPayload.username || tokenPayload.user?.name || tokenPayload.user?.username || tokenPayload.data?.name || tokenPayload.data?.username || 'New User'),
        role: tokenPayload.role || tokenPayload.user?.role || tokenPayload.data?.role || 'user',
        image: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
        contactNumber: typeof contactNumber === 'string' || contactNumber === null ? contactNumber ?? null : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);

      const comments = getCommentsByUserId(newUser.id);

      return NextResponse.json({
        error: false,
        data: {
          ...newUser,
          comments
        }
      });
    }

    // If email provided, ensure uniqueness
    if (email && email !== mockUsers[userIndex].email) {
      const existing = mockUsers.find(u => u.email === email);
      if (existing) {
        return NextResponse.json(
          { error: true, message: "Email already in use" },
          { status: 409 }
        );
      }
    }

    // Update user in mock database
    const updatedUser: MockUser = {
      ...mockUsers[userIndex],
      name: typeof name === 'string' ? name : mockUsers[userIndex].name,
      contactNumber: typeof contactNumber === 'string' || contactNumber === null 
        ? contactNumber 
        : mockUsers[userIndex].contactNumber,
      email: typeof email === 'string' ? email : mockUsers[userIndex].email,
      updatedAt: new Date().toISOString(),
    };
    
    // Update in mock database
    mockUsers[userIndex] = updatedUser;

    // Get user's comments
    const comments = getCommentsByUserId(updatedUser.id);

    return NextResponse.json({ 
      error: false, 
      data: {
        ...updatedUser,
        comments
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}