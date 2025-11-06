// app/admin/pages/page.tsx
'use client';
import { PageProvider } from '@/context/PageContext';
import PageManager from '@/components/admin/PageManager';

export default function AdminPages() {
  return (
    <PageProvider>
      <PageManager />
    </PageProvider>
  );
}