"use client";
import { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import NewsGrid, { Article } from './components/NewsGrid';
import Sidebar from './components/Sidebar';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setArticles(data.articles);
        } else {
          setError("Failed to load articles");
        }
      })
      .catch(err => {
        console.error('Error fetching articles:', err);
        setError("Failed to load articles");
      })
      .finally(() => setLoading(false));
  }, []);

  const breakingTitles = articles.slice(0, 5).map((a) => a.title);

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
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <HeroSection articles={articles} />
        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <NewsGrid articles={articles}/>
          </div>
          <aside>
            <Sidebar />
          </aside>
        </div>
      </div>
    </>
  );
}
