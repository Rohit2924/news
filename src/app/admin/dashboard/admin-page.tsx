"use client";

import { useState, useEffect } from "react";
import { Users, FileText, BarChart3, Settings, Plus, Eye } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalArticles: number;
  recentUsers: any[];
  recentArticles: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalArticles: 0,
    recentUsers: [],
    recentArticles: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      // Fetch users and articles data
      const [usersResponse, articlesResponse] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        fetch('/api/admin/articles', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null)
      ]);

      let usersData = { data: [] };
      let articlesData = { data: { articles: [] } };

      if (usersResponse?.ok) {
        usersData = await usersResponse.json();
      }
      if (articlesResponse?.ok) {
        articlesData = await articlesResponse.json();
      }

      setStats({
        totalUsers: usersData.data?.length || 0,
        totalArticles: articlesData.data?.articles?.length || 0,
        recentUsers: usersData.data?.slice(0, 5) || [],
        recentArticles: articlesData.data?.articles?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your application content and users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalArticles}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Analytics</p>
              <p className="text-2xl font-bold text-gray-900">View</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Settings</p>
              <p className="text-2xl font-bold text-gray-900">Config</p>
            </div>
            <Settings className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin/articles/add" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
              <Plus className="h-5 w-5 text-green-600" />
              <span className="font-medium">Add New Article</span>
            </Link>
            <Link href="/admin/users/add" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
              <Plus className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Add New User</span>
            </Link>
            <Link href="/admin/articles" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
              <Eye className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Manage Articles</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
              <Eye className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Manage Users</span>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                Mock Mode
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Authentication</span>
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <Link href="/admin/users" className="text-sm text-red-600 hover:text-red-700">View All</Link>
          </div>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : stats.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map((user: any, index: number) => (
                <div key={user.id || index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No users found</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Articles</h3>
            <Link href="/admin/articles" className="text-sm text-red-600 hover:text-red-700">View All</Link>
          </div>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : stats.recentArticles.length > 0 ? (
            <div className="space-y-3">
              {stats.recentArticles.map((article: any, index: number) => (
                <div key={article.id || index} className="p-3 border border-gray-100 rounded-lg">
                  <p className="font-medium text-gray-900 truncate">{article.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">By {article.author}</p>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {article.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No articles found</p>
          )}
        </div>
      </div>
    </div>
  );
}