"use client";

import { useEffect, useState } from "react";
import { Eye, Users, Clock, Percent } from "lucide-react";
import { io, Socket } from "socket.io-client";

function MetricCard({
  icon,
  iconBg,
  title,
  value,
  change,
  changeColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  change: string;
  changeColor: string;
}) {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBg}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className={`text-sm ${changeColor}`}>{change}</p>
        </div>
      </div>
    </div>
  );
}

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6 h-80 flex items-center justify-center">
      [{label}]
    </div>
  );
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState({ totalViews: 0, totalUsers: 0 });
  const [popularArticles, setPopularArticles] = useState<
    { rank: number; id: number; title: string; category: string; views: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/analytics', { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.data) {
          setMetrics({
            totalViews: data.data.totalViews,
            totalUsers: data.data.totalUsers,
          });
          setPopularArticles(
            (data.data.popularArticles || []).map((a: any, i: number) => ({ ...a, rank: i + 1 }))
          );
        }
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);
  

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 mx-5">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground mt-1">
            Track your website performance and user engagement
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Eye size={24} className="text-blue-600" />}
          iconBg="bg-blue-100"
          title="Total Page Views"
          value={metrics.totalViews.toLocaleString()}
          change="+12.5% from last month"
          changeColor="text-green-600"
        />
        <MetricCard
          icon={<Users size={24} className="text-green-600" />}
          iconBg="bg-green-100"
          title="Unique Visitors"
          value={metrics.totalUsers.toLocaleString()}
          change="+8.3% from last month"
          changeColor="text-green-600"
        />
        <MetricCard
          icon={<Clock size={24} className="text-yellow-600" />}
          iconBg="bg-yellow-100"
          title="Avg. Session Duration"
          value="4m 32s"
          change="+2.1% from last month"
          changeColor="text-green-600"
        />
        <MetricCard
          icon={<Percent size={24} className="text-red-600" />}
          iconBg="bg-red-100"
          title="Bounce Rate"
          value="32.4%"
          change="-1.2% from last month"
          changeColor="text-red-600"
        />
      </div>

      {/* Chart placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartPlaceholder label="Page Views Chart" />
        <ChartPlaceholder label="Traffic Sources Chart" />
      </div>

      {/* Popular Articles */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Most Popular Articles</h3>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : popularArticles.length === 0 ? (
          <div className="text-muted-foreground">No popular articles found.</div>
        ) : (
          <div className="space-y-4">
            {popularArticles?.map(({ rank, title, category, views }) => (
              <div key={rank} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-red-600">{rank}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                                      </div>
                </div>
                <span className="text-xs text-muted-foreground">{views.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
