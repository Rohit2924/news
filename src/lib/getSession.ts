import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    // Fix: verifyJWT returns { isValid, payload }, not payload directly
    const result = verifyJWT(token);
    if (!result.isValid || !result.payload) {
      return null;
    }

    const payload = result.payload; // This is the actual payload

    // Get user from database to ensure they still exist and have the correct role
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return null;
    }

    // If the user doesn't have a name, use the email's local part
    const name = user.name || payload.email.split('@')[0];

    return {
      user: {
        id: user.id,
        email: user.email,
        name: name,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}