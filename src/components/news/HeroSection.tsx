import React from 'react';
import { slugify } from '../../utils/slugify';

interface HeroSectionProps {
  category?: string;
  articles?: any[];
}

type NormalizedArticle = {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  timeAgo: string;
};

const HeroSection: React.FC<HeroSectionProps> = ({ category, articles }) => {
  // Default content for home page
  const isHomePage = !category;
  
  const getHighlightText = () => {
    if (isHomePage) {
      return "Breaking News";
    }
    return `${category} Highlight`;
  };

  const getHighlightContent = () => {
    if (isHomePage) {
      return "Latest Breaking News: Major Developments Across Nepal";
    }
    return `Latest ${category} News: Key Developments and Updates`;
  };

  const computeTimeAgo = (dateString?: string): string => {
    if (!dateString) return '';
    const then = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - then.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const normalize = (items: any[] | undefined): NormalizedArticle[] => {
    if (!items || items.length === 0) return [];
    return items.map((a) => ({
      title: a.title,
      excerpt: a.summary || a.excerpt || '',
      image: a.image || a.imageUrl || '',
category: (typeof a.category === 'string' ? a.category : a.category?.name) || category || 'News',
      timeAgo: computeTimeAgo(a.published_date),
    }));
  };

  const normalized = normalize(articles);

  const getMainArticle = (): NormalizedArticle => {
    if (normalized.length > 0) {
      return normalized[0];
    }
    // Default article for home page
    return {
      title: "Major Political Developments in Nepal",
      excerpt: "Significant political changes and developments are shaping the future of Nepal's governance and policy direction.",
      image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1200&q=80",
      category: "Politics",
      timeAgo: "2 hours ago"
    };
  };

  const getSideArticles = (): NormalizedArticle[] => {
    // Always derive from provided DB articles; show up to 3 after the main
    return normalized.slice(1, 4);
  };

  const mainArticle = getMainArticle();
  const sideArticles = getSideArticles();

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-6 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="bg-blue-600 text-white rounded-lg p-3 mb-6 overflow-hidden">
          <div className="flex items-center">
            <span className="bg-white text-blue-600 px-3 py-1 rounded font-bold text-sm mr-4 flex-shrink-0">{getHighlightText()}</span>
            <div className="flex-1 overflow-hidden">
              <div className="animate-pulse">{getHighlightContent()}</div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <a href={`/article/${slugify(mainArticle.title)}`} className="block group">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img src={mainArticle.image} alt={mainArticle.title} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">Top {mainArticle.category}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-3">{mainArticle.timeAgo}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 leading-tight">{mainArticle.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{mainArticle.excerpt}</p>
                  <span className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">Read More</span>
                </div>
              </div>
            </a>
          </div>
          <div className="order-1 md:order-2 space-y-4">
            {/* Featured Cards */}
            {sideArticles.map((article, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="flex">
                  <a href={`/article/${slugify(article.title)}`} className="flex flex-1">
                    <img src={article.image} alt={article.title} className="w-24 h-20 object-cover flex-shrink-0" />
                    <div className="p-4 flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-yellow-500 dark:bg-gray-700 text-white dark:text-blue-300 px-2 py-1 rounded text-xs">{article.category}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">{article.timeAgo}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2">{article.title}</h3>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;