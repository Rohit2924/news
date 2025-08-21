"use client";
import HeroSection from '../components/HeroSection';
import NewsGrid, { Article } from '../components/NewsGrid';
import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
import { slugify } from '../../utils/slugify';

type Subcat = { name: string; count: number };

export default function InternationalPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subcats, setSubcats] = useState<Subcat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [articlesRes, subRes] = await Promise.all([
          fetch('/api/articles?category=international', { cache: 'no-store' }).then(r => r.json()),
          fetch('/api/articles/subcategories?category=international').then(r => r.json()),
        ]);
        if (articlesRes.success) setArticles(articlesRes.articles);
        else setError('Failed to load articles');
        if (subRes.success) setSubcats(subRes.subcategories);
      } catch (e) {
        setError('Failed to load articles');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading International News...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">International News</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">International News</h1>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No international news available at the moment.</p>
            <a href="/" className="text-red-600 hover:underline">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <HeroSection category="International" articles={articles} />
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
    fetch(`/api/articles?category=international&subcategory=${encodeURIComponent(subcategory)}&limit=6`)
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
