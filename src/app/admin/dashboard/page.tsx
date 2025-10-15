"use client";

import React, { useState, useEffect } from "react";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { SectionCards } from "@/components/admin/section-cards";
import AdminDashboardStats from "@/components/admin/admin-dashboard-stats";
import RecentActivity from "@/components/admin/recent-activity";
import QuickActions from "@/components/admin/quick-actions";
import SystemHealth from "@/components/admin/system-health";

export default function Page() {
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data) {
        setRecentArticles(data.data.recentActivity.news || []);
        setAnalytics(data.data.analytics || null);
      }
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-2 md:gap-6 ">
        {/* Enhanced Stats Cards */}
        <SectionCards />

        {/* Quick Actions Panel */}
        <div className="px-4 lg:px-6">
          <QuickActions />
        </div>

        {/* Main Content Grid */}
        <div className="px-4 lg:px-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Charts and Tables */}
          <div className="xl:col-span-2 space-y-6">
            {/* Interactive Chart */}
            <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                User Engagement Analytics
              </h3>
              {/* You can pass analytics data to ChartAreaInteractive if needed */}
              <ChartAreaInteractive />
            </div>

            {/* Recent Articles Table */}
            <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Recent Articles
              </h3>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <ul className="divide-y divide-border">
                  {recentArticles.map(article => (
                    <li key={article.id} className="py-2 flex items-center gap-4">
                      <img src={article.image} alt={article.title} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <div className="font-medium">{article.title}</div>
                        <div className="text-xs text-muted-foreground">{article.author} • {new Date(article.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">Category: {article.category?.name || 'N/A'}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column - Activity and Health */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <RecentActivity />

            {/* System Health */}
            <SystemHealth />

            {/* Admin Dashboard Stats */}
            <AdminDashboardStats />
          </div>
        </div>
      </div>
    </div>
  )
}
