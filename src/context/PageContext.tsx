// contexts/PageContext.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Page, PageCategory } from '../types/page';

interface PageContextType {
  pages: Page[];
  categories: PageCategory[];
  addPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  getPageBySlug: (slug: string) => Page | undefined;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

const initialPages: Page[] = [
  {
    id: '1',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: '<h1>Privacy Policy</h1><p>Your privacy is important to us...</p>',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Terms of Service',
    slug: 'terms',
    content: '<h1>Terms of Service</h1><p>Please read these terms carefully...</p>',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'About Us',
    slug: 'about',
    content: '<h1>About Us</h1><p>Learn more about our company...</p>',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Contact',
    slug: 'contact',
    content: '<h1>Contact Us</h1><p>Get in touch with our team...</p>',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Advertise',
    slug: 'advertise',
    content: '<h1>Advertise With Us</h1><p>Advertising opportunities...</p>',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: 'Careers',
    slug: 'careers',
    content: '<h1>Careers</h1><p>Join our amazing team...</p>',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function PageProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>(initialPages);

  const addPage = (pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPage: Page = {
      ...pageData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPages(prev => [...prev, newPage]);
  };

  const updatePage = (id: string, updates: Partial<Page>) => {
    setPages(prev =>
      prev.map(page =>
        page.id === id
          ? { ...page, ...updates, updatedAt: new Date() }
          : page
      )
    );
  };

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(page => page.id !== id));
  };

  const getPageBySlug = (slug: string) => {
    return pages.find(page => page.slug === slug);
  };

  const categories: PageCategory[] = [
    {
      id: '1',
      name: 'Main Pages',
      pages: pages.filter(page => 
        ['quick-links', 'privacy-policy', 'terms', 'about'].includes(page.slug)
      ),
    },
    {
      id: '2',
      name: 'Support',
      pages: pages.filter(page => 
        ['contact', 'advertise', 'careers'].includes(page.slug)
      ),
    },
  ];

  return (
    <PageContext.Provider
      value={{
        pages,
        categories,
        addPage,
        updatePage,
        deletePage,
        getPageBySlug,
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