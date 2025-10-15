import { getSession } from '@/lib/getSession';
import { redirect } from 'next/navigation';
import prisma from '@/lib/models/prisma';
import { ReactNode } from 'react';

export default async function ProtectedEditorWrapper({ children }: { children: ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/Editor/login');
  }
  
  // Check if user is an editor
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, name: true }
  });
  
  if (user?.role !== 'EDITOR') {
    redirect('/Editor/login');
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editor Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                Welcome, {user.name}
              </span>
              <a
                href="/api/auth/logout"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}