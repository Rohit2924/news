import { notFound } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '../../../utils/slugify';
import prisma from '@/lib/models/prisma';
import ArticleComments from '@/components/news/ArticleComments';

// Define proper TypeScript types
interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  image: string;
  published_date: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}) {
  // Await params in Next.js 13+ App Router
  const { slug } = await params;
  
  try {
    // Find the article by slugified title with category information
    const articles = await prisma.news.findMany({
      include: {
        category: true,
      },
      orderBy: [
        { published_date: 'desc' },
        { id: 'desc' },
      ],
      take: 200,
    });

    const article = articles.find((a) => slugify(a.title) === slug);
    
    if (!article) {
      notFound();
    }

    const date = article.published_date || new Date().toISOString();

    // Find related articles with category information
    const relatedArticles = await prisma.news.findMany({
      where: { 
        id: { not: article.id },
        categoryId: article.categoryId // Get articles from the same category
      },
      include: {
        category: true,
      },
      orderBy: [
        { published_date: 'desc' },
        { id: 'desc' },
      ],
      take: 3,
    });

    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 uppercase">
            {article.category?.name || 'Uncategorized'}
          </span>
          <span className="text-gray-400 text-xs">
            {new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
        
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white leading-tight">
          {article.title}
        </h1>
        
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-72 object-cover rounded-lg mb-6 shadow" 
        />
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 italic border-l-4 border-red-500 pl-4 bg-gray-50 dark:bg-gray-800 py-2">
          {article.summary}
        </p>
        
        <hr className="my-8 border-gray-200 dark:border-gray-700" />
        
        <div className="prose dark:prose-invert max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: article.content || '<p>Content coming soon.</p>' }} />
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {relatedArticles.map((rel) => (
              <Link 
                key={rel.id} 
                href={`/article/${slugify(rel.title)}`} 
                className="block rounded-lg shadow bg-white dark:bg-gray-900 hover:shadow-lg transition p-4"
              >
                <div className="flex gap-4 items-center">
                  <img 
                    src={rel.image} 
                    alt={rel.title} 
                    className="w-20 h-16 object-cover rounded" 
                  />
                  <div>
                    <div className="text-xs text-red-600 font-semibold mb-1 uppercase">
                      {rel.category?.name || 'Uncategorized'}
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white line-clamp-2">
                      {rel.title}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Comments Section */}
        <ArticleComments newsId={article.id} articleTitle={article.title} />
        
        <Link href="/" className="inline-block text-red-600 hover:underline text-sm" prefetch={true}>
          &larr; Back to Home
        </Link>
      </div>
    );
  } catch (error) {
    console.error('Error loading article:', error);
    notFound();
  }
}