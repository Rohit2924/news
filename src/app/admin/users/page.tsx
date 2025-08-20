"use client";
import { useState, useEffect } from "react";
import { Edit, Trash2, Eye, Plus, Users as UsersIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";

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

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.message || 'Failed to fetch users');
      } else {
        setUsers(data.data || []);
        setError("");
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Delete user handler
  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.error) {
        toast.error(data.message || 'Failed to delete user');
      } else {
        setUsers(users.filter(u => u.id !== id));
        toast.success('User deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8 mx-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UsersIcon className="text-red-600" /> Users Management
        </h2>
        <Link href="/admin/users/add" className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 gap-2">
          <Plus size={18} /> Add User
        </Link>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-gray-500">Loading users...</p>
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
          <div className="p-8 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.contactNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                    <Link href={`/admin/users/${user.id}`} className="p-2 rounded hover:bg-gray-100 text-blue-600" title="View">
                      <Eye size={18} />
                    </Link>
                    <Link href={`/admin/users/${user.id}/edit`} className="p-2 rounded hover:bg-gray-100 text-yellow-600" title="Edit">
                      <Edit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(user.id, user.name || user.email)} 
                      className="p-2 rounded hover:bg-gray-100 text-red-600" 
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
      </div>
    </div>
  );
} 