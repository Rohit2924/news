'use client';

import React, { useState } from 'react';
import { useAuth } from '../components/ui/AuthContext';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/app/components/AdminSidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, userRole } = useAuth();
  const pathname = usePathname();

  // Check if this is the admin login page
  const isLoginPage = pathname === '/admin';
  
  // Check if user is authenticated and has admin access
  const hasAdminAccess = isAuthenticated && (userRole === 'admin' || userRole === 'editor');

  // If not on login page and not authenticated, show login
  if (!isLoginPage && !hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in with admin credentials to access this area.</p>
          <a 
            href="/admin" 
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      {!isLoginPage && (
        <>
          <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          {/* Mobile menu button */}
          <button
            className="fixed top-4 left-4 z-30 bg-white p-2 rounded-lg shadow-lg md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
        </>
      )}
      
      {/* Main content */}
      <main className={`${!isLoginPage ? 'md:ml-0' : ''} transition-all duration-300`}>
        {children}
      </main>
    </div>
  );
}