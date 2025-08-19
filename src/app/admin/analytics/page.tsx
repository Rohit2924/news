"use client";

import { Eye, Users, Clock, Percent } from "lucide-react";

export default function AnalyticsPage() {
  const popularArticles = [
    {
      rank: 1,
      title: "Nepal's Economic Growth Reaches 6.2%",
      category: "Politics",
      timeAgo: "2 hours ago",
      views: 2345,
    },
    // Add more articles here if needed
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 mx-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
          <p className="text-gray-600 mt-1">
            Track your website performance and user engagement
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            aria-label="Export analytics data"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Page Views */}
        <MetricCard
          icon={<Eye size={24} className="text-blue-600" />}
          iconBg="bg-blue-100"
          title="Total Page Views"
          value="124,567"
          change="+12.5% from last month"
          changeColor="text-green-600"
        />
        {/* Unique Visitors */}
        <MetricCard
          icon={<Users size={24} className="text-green-600" />}
          iconBg="bg-green-100"
          title="Unique Visitors"
          value="45,892"
          change="+8.3% from last month"
          changeColor="text-green-600"
        />
        {/* Avg. Session Duration */}
        <MetricCard
          icon={<Clock size={24} className="text-yellow-600" />}
          iconBg="bg-yellow-100"
          title="Avg. Session Duration"
          value="4m 32s"
          change="+2.1% from last month"
          changeColor="text-green-600"
        />
        {/* Bounce Rate */}
        <MetricCard
          icon={<Percent size={24} className="text-red-600" />}
          iconBg="bg-red-100"
          title="Bounce Rate"
          value="32.4%"
          change="-1.2% from last month"
          changeColor="text-red-600"
        />
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartPlaceholder label="Page Views Chart" />
        <ChartPlaceholder label="Traffic Sources Chart" />
      </div>

      {/* Popular Articles */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Most Popular Articles</h3>
          <a href="#" className="text-sm text-red-600 hover:text-red-700">
            View All
          </a>
        </div>
        <div className="space-y-4">
          {popularArticles.map(({ rank, title, category, timeAgo, views }) => (
            <div key={rank} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-red-600">{rank}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">
                    {category} &bull; {timeAgo}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-600">{views.toLocaleString()} views</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    <div className={`bg-white rounded-lg shadow p-6 border border-gray-200`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBg}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className={`text-sm ${changeColor}`}>{change}</p>
        </div>
      </div>
    </div>
  );
}

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 h-80 flex items-center justify-center text-gray-400">
      [{label}]
    </div>
  );
}
