"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Trash2, Eye, Plus, FileText, Loader2, Search, CheckSquare, Square, Calendar, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Article {
  id: number;
  title: string;
  categoryId: number;
  category?: { 
    id: number;
    name: string; 
    slug: string;
  };
  author: string;
  published_date: string;
  image: string;
  imageUrl: string;
  summary: string;
  content: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface FilterState {
  search: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  status: string;
}

// Skeleton Loading Components
const TableSkeleton = () => (
  <div className="hidden md:block space-y-4 p-6">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 animate-pulse">
        <div className="w-8 h-8 bg-[#262626] rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#262626] rounded w-3/4"></div>
          <div className="h-3 bg-[#262626] rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-[#262626] rounded w-20"></div>
        <div className="h-8 bg-[#262626] rounded w-24"></div>
      </div>
    ))}
  </div>
);

const MobileCardSkeleton = () => (
  <div className="md:hidden space-y-4 p-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-[#171717] border border-[#262626] rounded-lg p-4 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#262626] rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-[#262626] rounded w-48"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-[#262626] rounded w-16"></div>
                <div className="h-6 bg-[#262626] rounded w-20"></div>
              </div>
            </div>
          </div>
          <div className="w-6 h-6 bg-[#262626] rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categoryId: "",
    startDate: "",
    endDate: "",
    status: ""
  });

  const allIds = useMemo(() => articles.map(a => a.id), [articles]);
  const selectedIds = useMemo(() => allIds.filter(id => selected[id]), [allIds, selected]);
  const allSelected = selectedIds.length === allIds.length && allIds.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < allIds.length;

  useEffect(() => {
    fetchArticles(currentPage);
    fetchCategories();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchArticles = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.search.trim()) params.set('search', filters.search.trim());
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.status) params.set('filter', filters.status);
      
      params.set('page', page.toString());
      params.set('limit', '10');
      
      const response = await fetch(`/api/admin/articles?${params.toString()}`, {
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to fetch articles');
      } else {
        setArticles(data.data?.articles || []);
        setPagination(data.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false
        });
        setError("");
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchArticles(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      categoryId: "",
      startDate: "",
      endDate: "",
      status: ""
    });
    setCurrentPage(1);
    setTimeout(() => fetchArticles(1), 100);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleRowExpand = (id: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const deleteOne = async (id: number) => {
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'delete',
          articleIds: [Number(id)]
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to delete article');
        return false;
      } else {
        setArticles(prev => prev.filter(article => article.id !== id));
        toast.success('Article deleted successfully');
        
        if (articles.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchArticles(currentPage);
        }
        return true;
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      toast.error('Failed to delete article');
      return false;
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      const numericIds = selectedIds.map(id => Number(id));
      
      const response = await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'delete',
          articleIds: numericIds
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to delete articles');
      } else {
        toast.success(`Deleted ${data.data.affected} articles`);
        setSelected({});
        fetchArticles(currentPage);
      }
    } catch (err) {
      console.error('Bulk delete failed:', err);
      toast.error('Failed to delete articles');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    toast(
      `Delete "${title}"?`,
      {
        description: 'This action cannot be undone.',
        action: {
          label: 'Delete',
          onClick: async () => await deleteOne(id),
        },
        cancel: {
          label: 'Cancel',
          onClick: () => {},
        },
        duration: 10000,
      }
    );
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    toast(
      `Delete ${selectedIds.length} selected article(s)?`,
      {
        description: 'This action cannot be undone.',
        action: {
          label: 'Delete',
          onClick: handleBulkDelete,
        },
        cancel: { label: 'Cancel', onClick: () => {} },
        duration: 10000,
      }
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const next: Record<number, boolean> = {};
      for (const id of allIds) next[id] = true;
      setSelected(next);
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasActiveFilters = filters.search || filters.categoryId || filters.startDate || filters.endDate || filters.status;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'published':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  return (
    <div className="p-6 bg-[#0D0D0D] min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-red-600" /> Articles Management
        </h2>
        
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left Side - Search and Filters */}
          <div className="flex sm:flex-row items-start sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                placeholder="Search articles..."
                className="pl-9 pr-3 py-2 rounded-md border border-[#262626] bg-[#171717] text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-48 md:w-64 transition-colors"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                showFilters || hasActiveFilters 
                  ? 'bg-red-500/20 border-red-500/50 text-red-300' 
                  : 'bg-[#171717] border-[#262626] text-gray-300 hover:bg-[#262626]'
              }`}
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && (
                <span className="bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            {/* Bulk Delete Button */}
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDeleteConfirm}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete ({selectedIds.length})
              </button>
            )}

            {/* Add Article Button */}
            <Link 
              href="/admin/articles/add" 
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 gap-2"
            >
              <Plus size={18} /> Add Article
            </Link>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-[#171717] border border-[#262626] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Advanced Filters</h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X size={14} />
                  Clear All
                </button>
              )}
              <button
                onClick={applyFilters}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border border-[#262626] rounded-md bg-[#171717] text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                <option value="" className="text-gray-400">All Status</option>
                <option value="published" className="text-white">Published</option>
                <option value="drafts" className="text-white">Drafts</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full p-2 border border-[#262626] rounded-md bg-[#171717] text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                <option value="" className="text-gray-400">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id} className="text-white">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full pl-10 p-2 border border-[#262626] rounded-md bg-[#171717] text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                />
              </div>
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full pl-10 p-2 border border-[#262626] rounded-md bg-[#171717] text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-gray-400">Active filters:</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30">
              Search: "{filters.search}"
              <button onClick={() => handleFilterChange('search', '')} className="hover:text-blue-200">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30">
              Status: {filters.status === 'drafts' ? 'Drafts' : 'Published'}
              <button onClick={() => handleFilterChange('status', '')} className="hover:text-purple-200">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.categoryId && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30">
              Category: {categories.find(c => c.id.toString() === filters.categoryId)?.name}
              <button onClick={() => handleFilterChange('categoryId', '')} className="hover:text-green-200">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.startDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30">
              From: {new Date(filters.startDate).toLocaleDateString()}
              <button onClick={() => handleFilterChange('startDate', '')} className="hover:text-orange-200">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.endDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/20 text-pink-300 text-sm rounded-full border border-pink-500/30">
              To: {new Date(filters.endDate).toLocaleDateString()}
              <button onClick={() => handleFilterChange('endDate', '')} className="hover:text-pink-200">
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
      
      {/* Main Content */}
      <div className="overflow-x-auto bg-[#171717] rounded-lg shadow-sm border border-[#262626]">
        {loading ? (
          <>
            <TableSkeleton />
            <MobileCardSkeleton />
          </>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => fetchArticles(currentPage)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {hasActiveFilters ? 'No articles match your filters' : 'No articles found'}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-[#262626]">
                <thead className="bg-[#171717]">
                  <tr>
                    <th className="px-6 py-3 w-12">
                      <button 
                        onClick={toggleSelectAll}
                        className="p-1 rounded hover:bg-[#262626] transition-colors"
                        title={allSelected ? "Deselect all" : "Select all"}
                      >
                        {allSelected ? (
                          <CheckSquare className="h-4 w-4 text-red-600" />
                        ) : someSelected ? (
                          <div className="w-4 h-4 border-2 border-red-600 bg-red-500/20 rounded" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Published Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-[#262626]/50 transition-colors">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleSelectRow(article.id)}
                          className="p-1 rounded hover:bg-[#262626] transition-colors"
                        >
                          {selected[article.id] ? (
                            <CheckSquare className="h-4 w-4 text-red-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        <div className="max-w-xs truncate" title={article.title}>
                          {article.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold  bg-blue-100 text-blue-800">
                          {article.category?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-white dark:text-gray-600 ${getStatusBadge(article.status)}`}>
                          {article.status || 'published'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {article.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {article.published_date ? new Date(article.published_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex gap-2 justify-end">
                          <Link 
                            href={`/admin/articles/${article.id}`} 
                            className="p-2 rounded hover:bg-[#262626] text-blue-400 transition-colors" 
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link 
                            href={`/admin/articles/${article.id}/edit`} 
                            className="p-2 rounded hover:bg-[#262626] text-yellow-400 transition-colors" 
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button 
                            className="p-2 rounded hover:bg-[#262626] text-red-400 transition-colors" 
                            title="Delete" 
                            onClick={() => handleDelete(article.id, article.title)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {articles.map((article) => (
                <div key={article.id} className="bg-[#171717] border border-[#262626] rounded-lg p-4 shadow-sm transition-colors duration-200 hover:bg-[#262626]/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleSelectRow(article.id)}
                        className="p-1 rounded hover:bg-[#262626] transition-colors"
                      >
                        {selected[article.id] ? (
                          <CheckSquare className="h-4 w-4 text-red-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-medium text-white line-clamp-2">{article.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {article.category?.name || '-'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(article.status)}`}>
                            {article.status || 'published'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleRowExpand(article.id)}
                      className="p-1 rounded hover:bg-[#262626] transition-colors text-gray-400"
                    >
                      {expandedRows[article.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {expandedRows[article.id] && (
                    <div className="border-t border-[#262626] pt-3 mt-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-300">Author:</span>
                          <p className="text-gray-400">{article.author}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-300">Published:</span>
                          <p className="text-gray-400">
                            {article.published_date ? new Date(article.published_date).toLocaleDateString() : '-'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-300">Created:</span>
                          <p className="text-gray-400">{new Date(article.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Link 
                          href={`/admin/articles/${article.id}`} 
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                          <Eye size={14} /> View
                        </Link>
                        <Link 
                          href={`/admin/articles/${article.id}/edit`} 
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                        >
                          <Edit size={14} /> Edit
                        </Link>
                        <button 
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          onClick={() => handleDelete(article.id, article.title)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center m-2 px-6 mb-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 mr-4 rounded bg-[#262626] hover:bg-[#404040] disabled:opacity-50 transition-colors text-white"
              >
                Previous
              </button>

              <span className="text-sm text-gray-300">
                Page {pagination.page} of {pagination.totalPages} 
                {pagination.total > 0 && ` (${pagination.total} All articles)`}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages || pagination.totalPages === 0}
                className="px-3 py-1 ml-2 rounded bg-[#262626] hover:bg-[#404040] disabled:opacity-50 transition-colors text-white"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}