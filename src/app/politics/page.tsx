"use client";
import { useState, useEffect } from 'react';

import { slugify } from '../../utils/slugify';
import HeroSection from '@/components/news/HeroSection';
import Sidebar from '@/components/layout/Sidebar';
import NewsGrid, { Article } from '@/components/news/NewsGrid';

type Subcat = { name: string; count: number };

export default function PoliticsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subcats, setSubcats] = useState<Subcat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [articlesRes, subRes] = await Promise.all([
          fetch('/api/articles?category=politics').then(r => r.json()),
          fetch('/api/articles/subcategories?category=politics').then(r => r.json()),
        ]);
        if (articlesRes.success) setArticles(articlesRes.articles);
        else setError('Failed to load articles');
        if (subRes.success) setSubcats(subRes.subcategories);
      } catch (e) {
        console.error('Error fetching politics page data:', e);
        setError('Failed to load articles');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <HeroSection category="Politics" articles={articles} />
      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-10">
          <NewsGrid articles={articles}/>
          {subcats.map((sc) => (
            <SubcategorySection key={sc.name} subcategory={sc.name} />
          ))}
        </div>
        <aside>
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}

function SubcategorySection({ subcategory }: { subcategory: string }) {
  const [items, setItems] = useState<Article[]>([]);
  useEffect(() => {
    fetch(`/api/articles?category=politics&subcategory=${encodeURIComponent(subcategory)}&limit=6`)
      .then(r => r.json())
      .then(data => { if (data.success) setItems(data.articles); })
      .catch(() => {});
  }, [subcategory]);
  if (items.length === 0) return null;
  return (
    <section>
      <div className="flex items-center mb-4">
        <span className="bg-yellow-500 dark:bg-gray-700 text-white dark:text-blue-300 px-3 py-1 rounded text-sm font-medium">
          {subcategory}
        </span>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(a => (
          <div key={a.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <a href={`/article/${slugify(a.title)}`} className="block group">
              <img src={a.image} alt={a.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">{a.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{a.summary}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
