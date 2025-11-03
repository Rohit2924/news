'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DarkModeProvider } from '@/components/ui/dark-mode-context'
import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { SiteHeader } from '@/components/navigation/site-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth(); // FIX: Use 'user' instead of 'userRole'
  const pathname = usePathname();
  const router = useRouter();

  // Check if this is the admin login page
  const isLoginPage = pathname === '/admin';
  
  // Check if user is authenticated and has admin access
  const hasAdminAccess = isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'EDITOR'); // FIX: Use user.role

  // Handle authentication and redirects
  useEffect(() => {
    if (!isLoading) {
      // If not on login page and not authenticated, redirect to login
      if (!isLoginPage && !isAuthenticated) {
        router.push('/admin?redirect=' + encodeURIComponent(pathname));
        return;
      }
      
      // If not on login page and authenticated but not admin/editor, redirect to appropriate dashboard
      if (!isLoginPage && isAuthenticated && user && !(user.role === 'ADMIN' || user.role === 'EDITOR')) {
        switch (user.role) {
          case 'USER':
            router.push('/profile');
            break;
          default:
            router.push('/');
            break;
        }
        return;
      }
      
      // If on login page but already authenticated as admin, redirect to admin dashboard
      if (isLoginPage && isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'EDITOR')) {
        router.push('/admin/dashboard');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, isLoginPage, pathname, router]);

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
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go to Your Dashboard
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
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <DarkModeProvider>
      <div suppressHydrationWarning className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {isLoginPage ? (
          <main suppressHydrationWarning className="transition-all duration-300">
            {children}
          </main>
        ) : (
          <SidebarProvider
            style={{
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
          >
            <AppSidebar  />
            <SidebarInset>
              <SiteHeader />
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {children}
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        )}
      </div>
    </DarkModeProvider>
  );
}