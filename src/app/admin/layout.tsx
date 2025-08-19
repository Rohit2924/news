'use client';

import React, { useState } from 'react';
import AdminLoginPage from './page';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarFolded, setSidebarFolded] = useState(false);

  // Hide sidebar on /admin and /admin/login
  const isLoginPage = typeof window !== 'undefined' && ["/admin", "/admin/login"].includes(window.location.pathname);
  return (
    <div className="">
      
      {/* Toggle button for mobile */}
      {!isLoginPage && (
        <button
          className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded shadow-lg md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </button>
      )}
      {/* Main content, prevent interaction when sidebar is open */}
      <main className={`flex-1 ${sidebarFolded ? 'md:ml-0' : 'md:ml-[-24]'} transition-all duration-300 ${sidebarOpen ? 'pointer-events-none select-none opacity-60' : ''}`}>{children}</main>
    </div>
  );

}