"use client";

import { useState, useEffect, use } from "react";
import { UserCog, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from "@/lib/toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  contactNumber?: string | null;
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // FIX: Use React.use() to unwrap the params Promise
  const { id: userId } = use(params);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    contactNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    setFetching(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 401) {
        setError('Please login to access this page');
        setTimeout(() => router.push('/admin'), 2000);
        return;
      }

      if (response.status === 403) {
        setError('You do not have permission to access this page');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || `Failed to fetch user (HTTP ${response.status})`);
        return;
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.message || 'Failed to fetch user');
      } else {
        const user = data.data;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          role: user.role || "user",
          contactNumber: user.contactNumber || ""
        });
        setError("");
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user. Please check your connection.');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        toast.error('Please login to continue');
        setTimeout(() => router.push('/admin'), 2000);
        return;
      }

      if (response.status === 403) {
        toast.error('You do not have permission to update users');
        return;
      }

      const data = await response.json();

      if (data.error) {
        toast.error(data.message || 'Failed to update user');
      } else {
        toast.success('User updated successfully');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-6 dark:bg-[#0D0D0D] min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-gray-500 dark:text-gray-400">Loading user...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 dark:bg-[#0D0D0D] min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <div className="space-x-4">
              <button 
                onClick={fetchUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
              {error.includes('login') && (
                <button 
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 dark:bg-[#0D0D0D] min-h-screen">
      <div className="mb-8 mx-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UserCog className="text-red-600" /> Edit User
        </h2>
      </div>
      <div className="bg-white dark:bg-[#171717] rounded-lg shadow p-6 mx-5 border dark:border-[#262626]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#262626] rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-[#0D0D0D] dark:text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#262626] rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-[#0D0D0D] dark:text-white"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#262626] rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-[#0D0D0D] dark:text-white"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#262626] rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-[#0D0D0D] dark:text-white"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#262626] border border-gray-300 dark:border-[#404040] rounded-md hover:bg-gray-50 dark:hover:bg-[#363636] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}