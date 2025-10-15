"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Trash2, Eye, Plus, FileText, Loader2, Search, CheckSquare, Square } from "lucide-react";
import Link from "next/link";

import { toast } from "sonner";

// import { toast } from "@/lib/toast";

interface Article {
  id: number;
  title: string;
  categoryId: number;
  category?: { 
    name: string; 
    subcategory?: string; 
  };
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
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const allIds = useMemo(() => articles.map(a => a.id), [articles]);
  const selectedIds = useMemo(() => allIds.filter(id => selected[id]), [allIds, selected]);

useEffect(() => {
  // Check if auth-token cookie exists
  const authToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='));
  console.log('Auth token cookie:', authToken);
  console.log('Full cookies:', document.cookie);
}, []);



  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      
      // Token is stored in cookies (auth-token), no need to manually add it
      // The middleware will handle authentication via cookies
      const response = await fetch(`/api/articles?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // This sends cookies with the request
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.message || 'Failed to fetch articles');
      } else {
        // Updated to match backend response structure
        setArticles(data.articles || []);
        setError("");
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const deleteOne = async (id: number) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // This sends cookies with the request
      });

      const data = await response.json();
      
      if (data.error) {
        toast.error(data.message || 'Failed to delete');
      } else {
        setArticles(prev => prev.filter(article => article.id !== id));
        toast.success('Deleted');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      toast.error('Failed to delete');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    toast(
      `Delete "${title}"?`,
      {
        description: 'This action cannot be undone.',
        action: {
          label: 'Delete',
          onClick: async () => deleteOne(id),
        },
        cancel: {
          label: 'Cancel',
          onClick: () => {},
        },
        duration: 10000,
      }
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    toast(
      `Delete ${selectedIds.length} selected article(s)?`,
      {
        description: 'This action cannot be undone.',
        action: {
          label: 'Delete',
          onClick: async () => {
            for (const id of selectedIds) {
              // eslint-disable-next-line no-await-in-loop
              await deleteOne(id);
            }
            setSelected({});
          },
        },
        cancel: { label: 'Cancel', onClick: () => {} },
        duration: 10000,
      }
    );
  };

  const toggleSelectAll = () => {
    const allSelected = selectedIds.length === allIds.length && allIds.length > 0;
    if (allSelected) {
      setSelected({});
    } else {
      const next: Record<number, boolean> = {};
      for (const id of allIds) next[id] = true;
      setSelected(next);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8 mx-5">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="text-red-600" /> Articles Management
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchArticles(); }}
              placeholder="Search title, content, author..."
              className="pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete ({selectedIds.length})
            </button>
          )}
          <Link href="/admin/articles/add" className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 gap-2">
            <Plus size={18} /> Add Article
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-card text-card-foreground rounded-lg shadow-sm border border-border">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-muted-foreground">Loading articles...</p>
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
          <div className="p-8 text-center text-muted-foreground">
            No articles found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3">
                  <button onClick={toggleSelectAll} className="p-1 rounded hover:bg-muted">
                    {selectedIds.length === allIds.length && allIds.length > 0 ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Published Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <button onClick={() => setSelected(prev => ({ ...prev, [article.id]: !prev[article.id] }))} className="p-1 rounded hover:bg-muted">
                      {selected[article.id] ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    <div className="max-w-xs truncate" title={article.title}>
                      {article.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {article.category?.name|| '-'}
                    
                    </span>
                    {article.category?.subcategory && (
                      <span className="ml-1 px-2 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
                        {article.category.subcategory}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {article.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(article.published_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                    <Link href={`/admin/articles/${article.id}`} className="p-2 rounded hover:bg-muted text-blue-600" title="View">
                      <Eye size={18} />
                    </Link>
                    <Link href={`/admin/articles/${article.id}/edit`} className="p-2 rounded hover:bg-muted text-yellow-600" title="Edit">
                      <Edit size={18} />
                    </Link>
                    <button 
                      className="p-2 rounded hover:bg-muted text-red-600" 
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