// src/lib/models/article.ts
import prisma from './prisma';

// Create News
export async function createNews(data: {
  title: string;
  categoryId: string; // FIX: Use categoryId to link to the Category model
  author: string;
  published_date: string;
  image: string;
  imageUrl: string; // FIX: Add the required imageUrl field
  summary: string;
  content: string;
  tags: string[];
}) {
  return prisma.news.create({ data });
}

// Get all News
export async function getNews() {
  return prisma.news.findMany({
    include: { // Include the related category data
      category: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

// Get News by ID
export async function getNewsById(id: number) {
  return prisma.news.findUnique({ 
    where: { id },
    include: { // Include the related category data
      category: true
    }
  });
}

// Get News by Category ID
export async function getNewsByCategory(categoryId: string) { // FIX: Accept categoryId
  return prisma.news.findMany({
    where: { categoryId }, // FIX: Filter by categoryId
    include: { // Include the related category data
      category: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

// Update News
export async function updateNews(id: number, data: {
  title?: string;
  categoryId?: string; // FIX: Use categoryId
  author?: string;
  published_date?: string;
  image?: string;
  imageUrl?: string; // FIX: Add imageUrl
  summary?: string;
  content?: string;
  tags?: string[];
}) {
  return prisma.news.update({ where: { id }, data });
}

// Delete News
export async function deleteNews(id: number) {
  return prisma.news.delete({ where: { id } });
}