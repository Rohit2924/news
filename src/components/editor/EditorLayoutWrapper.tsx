import { getSession } from '@/lib/getSession';
import { redirect } from 'next/navigation';
import prisma from '@/lib/models/prisma';
import EditorSidebar from './EditorSidebar';

export default async function EditorLayoutWrapper({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/Editor/login');
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, name: true, email: true }
  });
  
  if (user?.role !== 'EDITOR') {
    redirect('/Editor/login');
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <EditorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Editor Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}