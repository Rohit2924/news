// src/app/admin/layout.tsx
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { SiteHeader } from '@/components/navigation/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DarkModeProvider } from '@/components/ui/dark-mode-context';
import { PageProvider } from '@/context/PageContext';
import { AdminClientWrapper } from '@/components/admin/admin-client-wrapper';

export default function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <DarkModeProvider>
      <PageProvider>
        <AdminClientWrapper>
          <div suppressHydrationWarning className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SidebarProvider
              style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties}
            >
              <AppSidebar />
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
          </div>
        </AdminClientWrapper>
      </PageProvider>
    </DarkModeProvider>
  );
}