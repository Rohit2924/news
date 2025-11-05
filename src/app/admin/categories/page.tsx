"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, FolderTree, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: Category;
  subcategories: Category[];
  _count: {
    articles: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false
  });

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '10');
      
      if (search.trim()) {
        params.set('search', search.trim());
      }

      const response = await fetch(`/api/admin/categories?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch categories');
      }

      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories || []);
        setPagination(data.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false
        });
        setError("");
      } else {
        setError(data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
      toast.error("Error loading categories", {
        description: err instanceof Error ? err.message : "Please try again"
      });
    } finally {
      setLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchCategories();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name) {
      toast.error("Category name is required");
      return;
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description || undefined,
          parentId: newCategory.parentId || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Category created successfully");
        setShowNewCategoryModal(false);
        setNewCategory({ name: "", description: "", parentId: "" });
        fetchCategories(); // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to create category');
      }
    } catch (err) {
      toast.error("Failed to create category", {
        description: err instanceof Error ? err.message : "Please try again"
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    toast(
      `Delete "${name}"?`,
      {
        description: 'This action cannot be undone.',
        action: {
          label: 'Delete',
          onClick: async () => {
            try {
              const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
                credentials: 'include',
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete category');
              }

              const data = await response.json();
              if (data.success) {
                toast.success("Category deleted successfully");
                fetchCategories(); // Refresh the list
              } else {
                throw new Error(data.error || 'Failed to delete category');
              }
            } catch (err) {
              toast.error("Failed to delete category", {
                description: err instanceof Error ? err.message : "Please try again"
              });
            }
          },
        },
        cancel: { label: 'Cancel', onClick: () => {} },
        duration: 10000,
      }
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-[#0D0D0D] min-h-screen">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage news categories and subcategories</p>
        </div>
        
        <button
          onClick={() => setShowNewCategoryModal(true)}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-md border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#171717] pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-md border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#171717] shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-red-600" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 dark:text-red-400">
            <p>{error}</p>
            <button 
              onClick={fetchCategories}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {search ? 'No categories match your search' : 'No categories found'}
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[#262626]">
              <thead className="bg-gray-50 dark:bg-[#171717]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Articles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#171717] divide-y divide-gray-200 dark:divide-[#262626]">
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FolderTree className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{category.description || 'No description'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-300 border border-blue-500/30">
                        {category._count.articles} articles
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {category.parent ? (
                        <span className="text-sm text-gray-600 dark:text-gray-400">{category.parent.name}</span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#262626] text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#262626] text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#171717]">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {categories.length} of {pagination.total} categories
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#171717] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262626] hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <span className="text-sm text-gray-500 dark:text-gray-400 px-3">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={currentPage === pagination.totalPages}
                    className="p-2 rounded border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#171717] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262626] hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Category</h2>
            <form onSubmit={handleCreateCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={e => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#0D0D0D] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newCategory.description}
                    onChange={e => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#0D0D0D] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors min-h-[100px]"
                    placeholder="Enter category description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Category</label>
                  <select
                    value={newCategory.parentId}
                    onChange={e => setNewCategory(prev => ({ ...prev, parentId: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#0D0D0D] px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">None (Top Level)</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="text-gray-900 dark:text-white">{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryModal(false);
                    setNewCategory({ name: "", description: "", parentId: "" });
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#171717] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 transition-colors"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}