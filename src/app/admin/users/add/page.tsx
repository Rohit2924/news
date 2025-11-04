"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from "@/lib/toast";

export default function AddUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    contactNumber: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include', // This should be here, not in headers
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check for HTTP errors first
      if (response.status === 401) {
        toast.error('Please login to continue');
        setTimeout(() => router.push('/admin'), 2000);
        return;
      }

      if (response.status === 403) {
        toast.error('You do not have permission to create users');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to create user (HTTP ${response.status})`);
        return;
      }

      const data = await response.json();

      if (data.error) {
        toast.error(data.message || 'Failed to create user');
      } else {
        toast.success('User created successfully');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 dark:bg-[#0D0D0D] min-h-screen">
      <div className="mb-8 mx-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlus className="text-red-600" /> Add New User
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
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}