import React from 'react';
import Link from 'next/link';

interface NewsCardProps {
  image: string;
  title: string;
  summary: string;
  link: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ image, title, summary, link }) => {
  return (
    <Link href={link} className="block h-full group focus:outline-none focus:ring-2 focus:ring-red-600 rounded-lg">
      <div className="rounded-lg shadow-md bg-white dark:bg-gray-900 p-4 flex flex-col h-full transition hover:shadow-lg group-hover:shadow-lg">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded mb-3"
        />
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white line-clamp-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{summary}</p>
        <span className="mt-auto inline-block text-sm font-semibold text-red-600 group-hover:underline">Read more</span>
      </div>
    </Link>
  );
};

export default NewsCard;