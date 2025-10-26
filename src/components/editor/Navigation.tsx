import { verifyJWT } from '@/lib/auth';
import prisma from '@/lib/models/prisma';
import Link from 'next/link';
import { cookies } from 'next/headers';

async function getUserRole(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true }
    });
    return user?.role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

export default async function Navigation() {
  // Get the token from cookies - need to await the cookies() call
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  // Verify the token and get user info
  let user = null;
  if (token) {
    try {
      const payload = verifyJWT(token);
      if (payload) {
        user = {
          email: payload.email,
          role: payload.role
        };
      }
    } catch (error) {
      console.error('Error verifying JWT token:', error);
    }
  }
  
  // Get user role if user exists
  const userRole = user?.email ? await getUserRole(user.email) : null;
  
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          News Portal
        </Link>
        
        <div className="flex space-x-4">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          
          {userRole === 'EDITOR' && (
            <Link href="/editor/dashboard" className="hover:text-gray-300">
              Editor Dashboard
            </Link>
          )}
          
          {userRole === 'ADMIN' && (
            <Link href="/admin/dashboard" className="hover:text-gray-300">
              Admin Dashboard
            </Link>
          )}
          
          {user ? (
            <Link href="/api/auth/signout" className="hover:text-gray-300">
              Sign Out
            </Link>
          ) : (
            <Link href="/login" className="hover:text-gray-300">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}