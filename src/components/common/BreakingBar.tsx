"use client";
import React, { useEffect, useState } from 'react';

const BreakingBar: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/articles?limit=5', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          const sortedNews = data.articles
            .sort((a: any, b: any) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
            .slice(0, 5);
          setNews(sortedNews);
        } else if (data.error) {
          console.error('API error:', data.error);
        }
      })
      .catch(error => {
        console.error('Failed to fetch breaking news:', error);
      });
  }, []);

  useEffect(() => {
    if (!news.length) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % news.length);
    }, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, [news]);

  return (
    <div className="bg-yellow-600 text-white py-2">
      <div className="container mx-auto px-4 flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <span className="font-bold">Breaking News:</span>
          {news.length > 0 ? (
            <a
              href={`/article/${encodeURIComponent((news[index].title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}`}
              className="truncate max-w-xs md:max-w-md lg:max-w-lg block hover:underline"
            >
              {news[index].title}
            </a>
          ) : (
            <span className="truncate max-w-xs md:max-w-md lg:max-w-lg block">Loading.....</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default BreakingBar;
