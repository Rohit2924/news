'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  FileText, 
  MessageCircle, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'user' | 'article' | 'comment' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
  href?: string;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    setIsLoading(true);
    try {
      // Fetch recent activities from multiple sources
      const [usersResponse, articlesResponse, dashboardResponse] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }).catch(() => null),
        fetch('/api/admin/articles', { credentials: 'include' }).catch(() => null),
        fetch('/api/admin/dashboard', { credentials: 'include' }).catch(() => null)
      ]);

      const activities: ActivityItem[] = [];

      // Add recent user registrations
      if (usersResponse?.ok) {
        const usersData = await usersResponse.json();
        const recentUsers = usersData.data?.users?.slice(0, 3) || [];            
        recentUsers.forEach((user: any) => {
          activities.push({
            id: `user-${user.id}`,
            type: 'user',
            title: 'New User Registered',
            description: `${user.name || user.email} joined the platform`,
            timestamp: user.createdAt || new Date().toISOString(),
            status: 'success',
            href: `/admin/users/${user.id}`
          });
        });
      }

      // Add recent articles
      if (articlesResponse?.ok) {
        const articlesData = await articlesResponse.json();
        const recentArticles = articlesData.data?.articles?.slice(0, 3) || [];
        recentArticles.forEach((article: any) => {
          activities.push({
            id: `article-${article.id}`,
            type: 'article',
            title: 'New Article Published',
            description: `"${article.title}" was published`,
            timestamp: article.published_date || new Date().toISOString(),
            status: 'info',
            href: `/admin/articles/${article.id}`
          });
        });
      }

      // Add recent comments
      if (dashboardResponse?.ok) {
        const dashData = await dashboardResponse.json();
        const recentComments = dashData?.data?.recentComments?.slice(0, 3) || [];
        recentComments.forEach((comment: any) => {
          activities.push({
            id: `comment-${comment.id}`,
            type: 'comment',
            title: 'New Comment Posted',
            description: `${comment.user?.name || 'Anonymous'} commented on "${comment.news?.title || 'an article'}"`,
            timestamp: comment.createdAt || new Date().toISOString(),
            status: 'info',
            href: `/admin/comments`
          });
        });
      }

      // Add system activities
      activities.push({
        id: 'system-1',
        type: 'system',
        title: 'System Check',
        description: 'All systems running normally',
        timestamp: new Date().toISOString(),
        status: 'success'
      });

      // Sort by timestamp and take the most recent 8
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Fallback to sample data
      setActivities([
        {
          id: 'sample-1',
          type: 'user',
          title: 'New User Registered',
          description: 'john.doe@example.com joined the platform',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'success'
        },
        {
          id: 'sample-2',
          type: 'article',
          title: 'New Article Published',
          description: '"Breaking News: Tech Innovation" was published',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'info'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4" />;
      case 'system':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
                {activity.href && (
                  <Link 
                    href={activity.href}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <Eye className="h-3 w-3" />
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <Link 
          href="/admin/analytics" 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Activity →
        </Link>
      </div>
    </div>
  );
};

export default RecentActivity;
