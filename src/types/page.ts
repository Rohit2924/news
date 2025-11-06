// src/types/page.ts
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageCategory {
  id: string;
  name: string;
  pages: Page[];
}