// contexts/PageContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Page, PageCategory } from '../types/page';

interface PageContextType {
  pages: Page[];
  categories: PageCategory[];
  loading: boolean;
  error: string | null;
  addPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePage: (id: string, updates: Partial<Page>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  getPageBySlug: (slug: string) => Page | undefined;
  refreshPages: () => Promise<void>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

// Helper to map database page to Page type
const mapDbPageToPage = (dbPage: any): Page => ({
  id: dbPage.id,
  title: dbPage.pageTitle,
  slug: dbPage.pageSlug,
  content: dbPage.pageContent,
  isActive: dbPage.isActive,
  createdAt: new Date(dbPage.createdAt),
  updatedAt: new Date(dbPage.updatedAt),
});

export function PageProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pages from API
  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/pages', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }

      const data = await response.json();
      if (data.success) {
        const mappedPages = data.data.map(mapDbPageToPage);
        setPages(mappedPages);
      } else {
        throw new Error(data.error || 'Failed to fetch pages');
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const addPage = async (pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pageSlug: pageData.slug,
          pageTitle: pageData.title,
          pageContent: pageData.content,
          isActive: pageData.isActive,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchPages(); // Refresh pages list
      } else {
        throw new Error(data.error || 'Failed to create page');
      }
    } catch (err) {
      console.error('Error adding page:', err);
      throw err;
    }
  };

  const updatePage = async (id: string, updates: Partial<Page>) => {
    try {
      const page = pages.find(p => p.id === id);
      if (!page) throw new Error('Page not found');

      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id,
          pageTitle: updates.title ?? page.title,
          pageContent: updates.content ?? page.content,
          pageSlug: updates.slug ?? page.slug,
          isActive: updates.isActive ?? page.isActive,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchPages(); // Refresh pages list
      } else {
        throw new Error(data.error || 'Failed to update page');
      }
    } catch (err) {
      console.error('Error updating page:', err);
      throw err;
    }
  };

  const deletePage = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/pages?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        await fetchPages(); // Refresh pages list
      } else {
        throw new Error(data.error || 'Failed to delete page');
      }
    } catch (err) {
      console.error('Error deleting page:', err);
      throw err;
    }
  };

  const getPageBySlug = (slug: string) => {
    return pages.find(page => page.slug === slug);
  };

  const categories: PageCategory[] = [
    {
      id: '1',
      name: 'Main Pages',
      pages: pages.filter(page => 
        ['privacy-policy', 'terms', 'about'].includes(page.slug)
      ),
    },
    {
      id: '2',
      name: 'Support',
      pages: pages.filter(page => 
        ['contact', 'advertise', 'careers'].includes(page.slug)
      ),
    },
    {
      id: '3',
      name: 'Other Pages',
      pages: pages.filter(page => 
        !['privacy-policy', 'terms', 'about', 'contact', 'advertise', 'careers'].includes(page.slug)
      ),
    },
  ];

  return (
    <PageContext.Provider
      value={{
        pages,
        categories,
        loading,
        error,
        addPage,
        updatePage,
        deletePage,
        getPageBySlug,
        refreshPages: fetchPages,
      }}
    >
      {children}
    </PageContext.Provider>
  );
}

export function usePages() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePages must be used within a PageProvider');
  }
  return context;
}