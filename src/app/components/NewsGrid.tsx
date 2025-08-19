import React from 'react';
import NewsCard from './NewsCard';
import { slugify } from '../../utils/slugify';

export type Article = {
  id: number;
  title: string;
  category: string;
  subcategory: string;
  author: string;
  published_date: string;
  image: string;
  summary: string;
  content: string;
  tags: string[];
};

const NewsGrid = ({ articles }: { articles: Article[] }) => (
  <section className="py-12 bg-white dark:bg-gray-900 transition-colors duration-200">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white">Latest News</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <NewsCard
            key={article.id}
            image={article.image}
            title={article.title}
            summary={article.summary}
            link={`/article/${slugify(article.title)}`}
          />
        ))}
      </div>
    </div>
  </section>
);

export default NewsGrid;
