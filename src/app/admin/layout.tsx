'use client';

import React, { useState } from 'react';

import { usePathname } from 'next/navigation';
// import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DarkModeProvider } from '@/components/ui/dark-mode-context'
import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { SiteHeader } from '@/components/navigation/site-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, userRole } = useAuth();
  const pathname = usePathname();

  // Check if this is the admin login page
  const isLoginPage = pathname === '/admin';
  
  // Check if user is authenticated and has admin access
  const hasAdminAccess = isAuthenticated && (userRole === 'ADMIN' || userRole === 'EDITOR');

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
            <AppSidebar variant="inset" />
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