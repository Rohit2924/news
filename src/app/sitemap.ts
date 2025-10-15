import { MetadataRoute } from 'next';
import prisma from '@/lib/models/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Get site settings
  const siteSettings = await prisma.siteSettings.findFirst();
  const siteUrl = siteSettings?.siteUrl || baseUrl;
  
  // Get all news articles
  const news = await prisma.news.findMany({
    select: {
      id: true,
      updatedAt: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  // Get all active pages
  const pages = await prisma.pageContent.findMany({
    where: {
      isActive: true
    },
    select: {
      pageSlug: true,
      updatedAt: true
    }
  });
  
  // Static routes
  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];
  
  // News article routes
  const newsRoutes = news.map((article) => ({
    url: `${siteUrl}/news/${article.id}`,
    lastModified: article.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Dynamic page routes
  const pageRoutes = pages.map((page) => ({
    url: `${siteUrl}/page/${page.pageSlug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  
  return [...staticRoutes, ...newsRoutes, ...pageRoutes];
}