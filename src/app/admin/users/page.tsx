"use client";

import { useState, useEffect, useMemo } from "react";
import { Edit, Trash2, Eye, Plus, Users as UsersIcon, Loader2, Search, CheckSquare, Square } from "lucide-react";
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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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
        credentials: 'include', // This ensures cookies are sent
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch users');
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
        setHasMore(data.data.pagination.hasMore);
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
        toast.error(data.message || 'Failed to delete');
      } else {
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success('Deleted');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete');
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
          onClick: async () => deleteOne(id),
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
      const next: Record<string, boolean> = {};
      for (const id of allIds) next[id] = true;
      setSelected(next);
    }
  };

  return (
    <div className="p-6">
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
              onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(); }}
              placeholder="Search name, email..."
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
          <Link href="/admin/users/add" className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 gap-2">
            <Plus size={18} /> Add User
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-card text-card-foreground rounded-lg shadow-sm border border-border">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchUsers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No users found
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
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <button onClick={() => setSelected(prev => ({ ...prev, [user.id]: !prev[user.id] }))} className="p-1 rounded hover:bg-muted">
                      {selected[user.id] ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {user.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.contactNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                    <Link href={`/admin/users/${user.id}`} className="p-2 rounded hover:bg-muted text-blue-600" title="View">
                      <Eye size={18} />
                    </Link>
                    <Link href={`/admin/users/${user.id}/edit`} className="p-2 rounded hover:bg-muted text-yellow-600" title="Edit">
                      <Edit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(user.id, user.name || user.email)} 
                      className="p-2 rounded hover:bg-muted text-red-600" 
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
              className="px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 