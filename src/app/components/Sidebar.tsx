"use client";
import React, { useEffect, useState } from 'react';

const Sidebar = () => {
  const [trending, setTrending] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    fetch('/api/articles?limit=5', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrending(data.articles.map((a: any) => ({ id: a.id, title: a.title })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="space-y-8">
      {/* Trending News */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-3">
          <h3 className="font-bold text-lg">Trending News</h3>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            {trending.length ? (
              trending.map((item, idx) => (
                <li key={item.id} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-200">
                  <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">{idx+1}</span>
                  <a href={`/article/${encodeURIComponent(item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}`} className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed hover:underline">
                    {item.title}
                  </a>
                </li>
              ))
            ) : (
              [1,2,3,4,5].map((idx) => (
                <li key={idx} className="flex items-start space-x-3 p-2">
                  <span className="bg-gray-300 dark:bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">{idx}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">Loading...</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      {/* Weather Widget */}
      <div className="bg-gray-500 text-gray-800 px-4 py-3 rounded-lg shadow-md" >
        <h3 className="font-bold text-lg ">Weather</h3>
        <div className="text-center mt-2">
          <div className="text-4xl mb-2">☀️</div>
          <div className="text-2xl font-bold text-gray-500">25°C</div>
          <div className="text-sm text-gray-500 mt-1">Kathmandu</div>
          <div className="text-xs text-gray-500 mt-2">Clear Sky</div>
        </div>
      </div>
      {/* Social Widget */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white px-4 py-3">
          <h3 className="font-bold text-lg">Social</h3>
        </div>
        <div className="p-4 space-y-3">
          {[
            {icon: '📘', name: 'Facebook', count: '10,000'},
            {icon: '🐦', name: 'Twitter', count: '5,000'},
            {icon: '📺', name: 'YouTube', count: '15,000'},
            {icon: '📷', name: 'Instagram', count: '8,000'},
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
              <div className="flex items-center space-x-3"><span className="text-2xl">{item.icon}</span><span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span></div><span className="text-sm text-gray-500 dark:text-gray-400">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Newsletter Widget */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
        <h3 className="font-bold text-lg mb-3">Newsletter</h3>
        <p className="text-sm mb-4 opacity-90">Get daily news straight to your email</p>
        <div className="space-y-3">
          <input type="email" placeholder="Your email address" className="w-full px-4 py-2 rounded text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white" />
          <button className="w-full bg-white text-red-600 py-2 rounded font-medium hover:bg-gray-100 transition-colors duration-200">Subscribe</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 