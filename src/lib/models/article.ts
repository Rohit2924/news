import prisma from './prisma';

// Create News
export async function createNews(data: {
  title: string;
  category: string;
  subcategory?: string;
  author: string;
  published_date: string;
  image: string;
  summary: string;
  content: string;
  tags: string[];
}) {
  return prisma.news.create({ data });
}

// Get all News
export async function getNews() {
  return prisma.news.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
}

// Get News by ID
export async function getNewsById(id: number) {
  return prisma.news.findUnique({ where: { id } });
}

// Get News by Category
export async function getNewsByCategory(category: string) {
  return prisma.news.findMany({
    where: { category },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

// Update News
export async function updateNews(id: number, data: {
  title?: string;
  category?: string;
  subcategory?: string;
  author?: string;
  published_date?: string;
  image?: string;
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
