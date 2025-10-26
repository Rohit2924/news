"use client";

import { useState, useEffect } from "react";
import { User, Loader2, Edit, ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  contactNumber?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ViewUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      if (!Credential) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`/api/admin/users/${params.id}`, {
        headers: {
          'credentials': 'include',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.message || 'Failed to fetch user');
      } else {
        setUser(data.data);
        setError("");
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user');
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
            <p className="text-gray-500">Loading user...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'User not found'}</p>
            <button 
              onClick={fetchUser}
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
            <User className="text-red-600" /> User Details
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mx-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              <p className="text-lg font-semibold text-gray-900">{user.name || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                user.role === 'admin' 
                  ? 'bg-red-100 text-red-800' 
                  : user.role === 'editor'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
              <p className="text-lg text-gray-900">{user.contactNumber || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
              <p className="text-lg text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
              <p className="text-lg text-gray-900">{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <Link
              href={`/admin/users/${user.id}/edit`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 gap-2"
            >
              <Edit size={16} />
              Edit User
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
