"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2, Edit, ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { apiCall } from '@/lib/api';

interface Article {
  id: number;
  title: string;
  category: string;
  subcategory?: string;
  author: string;
  published_date: string;
  image: string;
  summary: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ViewArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArticle();
  }, []);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const data = await apiCall<{ data: Article }>(`/api/admin/articles/${params.id}`);
      setArticle(data.data);
      setError("");
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-gray-500">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Article not found'}</p>
            <button 
              onClick={fetchArticle}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 mx-5">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="text-red-600" /> Article Details
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mx-5">
        {/* Article Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>By {article.author}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(article.published_date).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {article.category}
              </span>
              {article.subcategory && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                  {article.subcategory}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Article Image */}
        {article.image && (
          <div className="mb-6">
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Article Summary */}
        {article.summary && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
            <p className="text-gray-700 leading-relaxed">{article.summary}</p>
          </div>
        )}

        {/* Article Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
          <div 
            className="prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Tag size={18} />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span> {new Date(article.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {new Date(article.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <Link
              href={`/admin/articles/${article.id}/edit`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 gap-2"
            >
              <Edit size={16} />
              Edit Article
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}