// src/app/admin/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DarkModeProvider } from '@/components/ui/dark-mode-context'
import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { SiteHeader } from '@/components/navigation/site-header';
import { PageProvider } from '@/context/PageContext'; // Add this import

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check if this is the admin login page
  const isLoginPage = pathname === '/login';
  
  // Check if user is authenticated and has admin access
  const hasAdminAccess = isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'EDITOR');

  // Handle authentication and redirects
  // useEffect(() => {
  //   if (!isLoading) {
  //     // If not on login page and not authenticated, redirect to login
  //     if (!isLoginPage && !isAuthenticated) {
  //       router.push('/admin');
  //       return;
  //     }
      
  //     // If not on login page and authenticated but not admin/editor, redirect to appropriate dashboard
  //     if (!isLoginPage && isAuthenticated && user && !(user.role === 'ADMIN' || user.role === 'EDITOR')) {
  //       switch (user.role) {
  //         case 'USER':
  //           router.push('/profile');
  //           break;
  //         default:
  //           router.push('/');
  //           break;
  //       }
  //       return;
  //     }
      
  //     // If on login page but already authenticated as admin, redirect to admin dashboard
  //     if (isLoginPage && isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'EDITOR')) {
  //       router.push('/admin/dashboard');
  //       return;
  //     }
  //   }
  // }, [isAuthenticated, user, isLoading, isLoginPage, pathname, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Show access denied only for specific cases
  if (!isLoginPage && isAuthenticated && user && !(user.role === 'ADMIN' || user.role === 'EDITOR')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin area.</p>
          <button 
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Login to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show login prompt for unauthenticated users on admin pages
  if (!isLoginPage && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access this area.</p>
          <button
            onClick={() => router.push('/login?redirect=' + encodeURIComponent(pathname))}
            // onClick={()=>{alert('btn clicked')}}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render the admin layout for authenticated users
  return (
    <PageProvider>
      <DarkModeProvider>
        <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <AppSidebar />
          <SidebarInset>
            <SiteHeader />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </DarkModeProvider>
    </PageProvider>
  );
}