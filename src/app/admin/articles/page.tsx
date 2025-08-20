"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, Eye, Plus, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch('/api/admin/articles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.message || 'Failed to fetch articles');
      } else {
        setArticles(data.data?.articles || []);
        setError("");
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete article "${title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.error) {
        toast.error(data.message || 'Failed to delete article');
      } else {
        setArticles(articles.filter(article => article.id !== id));
        toast.success('Article deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      toast.error('Failed to delete article');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8 mx-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="text-red-600" /> Articles Management
        </h2>
        <Link href="/admin/articles/add" className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 gap-2">
          <Plus size={18} /> Add Article
        </Link>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchArticles}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No articles found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Published Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="max-w-xs truncate" title={article.title}>
                      {article.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {article.category}
                    </span>
                    {article.subcategory && (
                      <span className="ml-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {article.subcategory}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {article.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.published_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                    <Link href={`/admin/articles/${article.id}`} className="p-2 rounded hover:bg-gray-100 text-blue-600" title="View">
                      <Eye size={18} />
                    </Link>
                    <Link href={`/admin/articles/${article.id}/edit`} className="p-2 rounded hover:bg-gray-100 text-yellow-600" title="Edit">
                      <Edit size={18} />
                    </Link>
                    <button 
                      className="p-2 rounded hover:bg-gray-100 text-red-600" 
                      title="Delete" 
                      onClick={() => handleDelete(article.id, article.title)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}