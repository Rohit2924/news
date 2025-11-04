"use client";

import { useState, useEffect, useMemo } from "react";
import { Edit, Trash2, Eye, Plus, Users as UsersIcon, Loader2, Search, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  contactNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const allIds = useMemo(() => users.map(u => u.id), [users]);
  const selectedIds = useMemo(() => allIds.filter(id => selected[id]), [allIds, selected]);
  const allSelected = selectedIds.length === allIds.length && allIds.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < allIds.length;

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      params.set('page', page.toString());
      params.set('limit', '10');

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch users');
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setHasMore(data.data.pagination?.hasMore || false);
        setTotalUsers(data.data.pagination?.total || 0);
        setError("");
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      toast.error("Error loading users", {
        description: err instanceof Error ? err.message : "Please try again"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOne = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.error) {
        toast.error(data.message || 'Failed to delete user');
        return false;
      } else {
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success('User deleted successfully');
        return true;
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
      return false;
    }
  };

  // Delete user handler
  const handleDelete = async (id: string, userName: string) => {
    toast(
      `Delete "${userName}"?`,
      {
        description: 'This action cannot be undone.',
        action: {
          label: 'Delete',
          onClick: async () => await deleteOne(id),
        },
        cancel: { label: 'Cancel', onClick: () => {} },
        duration: 10000,
      }
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    toast(
      `Delete ${selectedIds.length} selected user(s)?`,
      {
        description: 'This action cannot be undone.',
        action: {
          label: 'Delete',
          onClick: async () => {
            const results = await Promise.allSettled(
              selectedIds.map(id => deleteOne(id))
            );
            
            const successfulDeletes = results.filter(result => result.status === 'fulfilled' && result.value).length;
            
            if (successfulDeletes > 0) {
              toast.success(`Successfully deleted ${successfulDeletes} users`);
            }
            
            if (successfulDeletes < selectedIds.length) {
              toast.error(`Failed to delete ${selectedIds.length - successfulDeletes} users`);
            }
            
            setSelected({});
            fetchUsers();
          },
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
      const next: Record<string, boolean> = {};
      for (const id of allIds) next[id] = true;
      setSelected(next);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get role badge color - consistent for both light and dark modes
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40';
      case 'editor':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/40';
      case 'user':
        return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/40';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-[#0D0D0D] min-h-screen">
      <div className="flex items-center justify-between mb-8 mx-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UsersIcon className="text-red-600" /> Users Management
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email..."
              className="pl-9 pr-3 py-2 rounded-md border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#171717] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-64 transition-colors"
            />
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete ({selectedIds.length})
            </button>
          )}
          <Link 
            href="/admin/users/add" 
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 gap-2"
          >
            <Plus size={18} /> Add User
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-[#262626] shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={fetchUsers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {search ? 'No users match your search' : 'No users found'}
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[#262626]">
              <thead className="bg-gray-50 dark:bg-[#171717]">
                <tr>
                  <th className="px-6 py-3 w-12">
                    <button 
                      onClick={toggleSelectAll}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#171717] divide-y divide-gray-200 dark:divide-[#262626]">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleSelectRow(user.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
                      >
                        {selected[user.id] ? (
                          <CheckSquare className="h-4 w-4 text-red-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {user.contactNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        <Link 
                          href={`/admin/users/${user.id}`} 
                          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#262626] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" 
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          href={`/admin/users/${user.id}/edit`} 
                          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#262626] text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors" 
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(user.id, user.name || user.email)} 
                          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#262626] text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" 
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#171717]">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {users.length} of {totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#171717] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262626] hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="text-sm text-gray-500 dark:text-gray-400 px-3">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore}
                  className="p-2 rounded border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#171717] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262626] hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}