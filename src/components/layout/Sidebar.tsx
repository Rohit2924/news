"use client";
import React, { useEffect, useState } from 'react';
import { 
  IconBrandFacebook, 
  IconBrandTwitter, 
  IconBrandInstagram, 
  IconBrandYoutube,
  IconTrendingUp,
  IconCloud,
  IconShare,
  IconMail
} from '@tabler/icons-react';



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
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl/30 overflow-hidden  ">
        <div className="bg-red-600 text-white px-4 py-3 ">
          <h3 className="font-bold text-lg">Trending News</h3>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            {trending.length ? (
              trending.map((item, idx) => (
                <li key={item.id} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-200">
                  <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">{idx+1}</span>
                  <a href={`/article/${encodeURIComponent(item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}`} className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed hover:underline">
                    {item.title}
                  </a>
                </li>
              ))
            ) : (
              [1,2,3,4,5].map((idx) => (
                <li key={idx} className="flex items-start space-x-3 p-2">
                  <span className="bg-gray-300 dark:bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">{idx}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">Loading...</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      {/* Weather Widget */}
      <div className="bg-linear-to-br from-blue-500 to-blue-600 dark:from-gray-800 dark:to-gray-900 text-white p-6 rounded-2xl shadow-lg border border-blue-400/20 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Weather</h3>
          <div className="text-xs bg-white/20 dark:bg-gray-700/50 px-2 py-1 rounded-full">
            Live
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="text-5xl">☀️</div>
          </div>
          
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <div className="text-3xl font-bold">25°C</div>
            <div className="text-sm text-blue-100 dark:text-gray-400">/ 77°F</div>
          </div>
          
          <div className="text-blue-100 dark:text-gray-300 font-medium mb-2">Kathmandu</div>
          
          <div className="text-sm text-blue-100/90 dark:text-gray-400 mb-4">Clear Sky</div>
          
          {/* Weather Details */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-400/30 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-xs text-blue-100/80 dark:text-gray-400 mb-1">Humidity</div>
              <div className="text-sm font-semibold">65%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-blue-100/80 dark:text-gray-400 mb-1">Wind</div>
              <div className="text-sm font-semibold">12 km/h</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-blue-100/80 dark:text-gray-400 mb-1">Feels like</div>
              <div className="text-sm font-semibold">27°C</div>
            </div>
          </div>
        </div>
      </div>
       {/* Social Widget */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-5 py-4">
          <div className="flex items-center gap-2">
            <IconShare size={20} />
            <h3 className="font-bold text-lg">Social Platforms</h3>
          </div>
        </div>
        
        <div className="p-5 space-y-3">
          {[
            {icon: <IconBrandFacebook size={24} className="text-blue-600" />, name: 'Facebook', count: '10.2K'},
            {icon: <IconBrandTwitter size={24} className="text-sky-500" />, name: 'Twitter', count: '5.7K'}, 
            {icon: <IconBrandInstagram size={24} className="text-pink-600" />, name: 'Instagram', count: '8.5K'},
            {icon: <IconBrandYoutube size={24} className="text-red-600" />, name: 'YouTube', count: '15.1K'},
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium text-gray-800 dark:text-white">{item.name}</span>
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-200">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Widget */}
      <div className="bg-linear-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 text-white shadow-lg border border-gray-600/20 dark:border-gray-500/30">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <IconMail size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Stay Connected</h3>
          <p className="text-sm opacity-90">Never miss important updates</p>
        </div>
        <div className="space-y-3">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="w-full px-4 py-3 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 border-0"
          />
          <button className="w-full bg-white text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            Subscribe
          </button>
        </div>
        <p className="text-xs text-center mt-3 opacity-80"> unsubscribe anytime</p>
      </div>
    </aside>
  );
};

export default Sidebar;