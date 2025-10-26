'use client';
import { useState, useEffect } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Users, FileText, MessageCircle, Eye, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Type definitions for robust type safety
interface DashboardStats {
  totalUsers: number;
  totalArticles: number;
  totalComments: number;
  totalViews: number;
  userGrowth: number;
  articleGrowth: number;
  commentGrowth: number;
  viewGrowth: number;
}

interface DashboardResponse {
  success: boolean;
  data?: {
    overview: {
      totalUsers: number;
      totalNews: number;
      totalComments: number;
    };
    analytics: {
      totalViews?: number;
      userGrowth?: number;
      articleGrowth?: number;
      commentGrowth?: number;
      viewGrowth?: number;
    };
  };
  error?: string;
}

const DEFAULT_STATS: DashboardStats = {
  totalUsers: 0,
  totalArticles: 0,
  totalComments: 0,
  totalViews: 0,
  userGrowth: 0,
  articleGrowth: 0,
  commentGrowth: 0,
  viewGrowth: 0,
};

export function SectionCards() {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);


  const fetchDashboardStats = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
      toast.info("Refreshing dashboard data...");
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
        cache: 'no-store'
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
  
      const data: DashboardResponse = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Invalid response from server');
      }
  
      


      const { overview, analytics } = data.data;
      
      setStats({
        totalUsers: overview.totalUsers,
        totalArticles: overview.totalNews,
        totalComments: overview.totalComments,
        totalViews: analytics.totalViews || 0,
        userGrowth: analytics.userGrowth || 0,
        articleGrowth: analytics.articleGrowth || 0,
        commentGrowth: analytics.commentGrowth || 0,
        viewGrowth: analytics.viewGrowth || 0,
      });
      
      setLastUpdated(new Date());
      
      if (isManualRefresh) {
        toast.success("Dashboard data updated successfully");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Dashboard fetch error:', err);
      
      // Show error toast with retry option
      toast.error(errorMessage, {
        action: {
          label: "Retry",
          onClick: () => fetchDashboardStats(true)
        }
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardStats();
    
    // Auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchDashboardStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Render growth badge with proper styling
  const renderGrowthBadge = (value: number) => {
    const isPositive = value >= 0;
    const Icon = isPositive ? IconTrendingUp : IconTrendingDown;
    
    return (
      <Badge variant={isPositive ? "default" : "destructive"}>
        <Icon className="h-3 w-3 mr-1" />
        {isPositive ? '+' : ''}{value}%
      </Badge>
    );
  };

  // Render a single stat card
  const renderStatCard = (
    title: string,
    value: number,
    growth: number,
    icon: React.ReactNode,
    description: string,
    positiveText: string,
    negativeText: string
  ) => (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value.toLocaleString()}
        </CardTitle>
        <CardAction>
          {renderGrowthBadge(growth)}
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {growth >= 0 ? positiveText : negativeText}
          {growth >= 0 ? (
            <IconTrendingUp className="size-4" />
          ) : (
            <IconTrendingDown className="size-4" />
          )}
        </div>
        <div className="text-muted-foreground">{description}</div>
      </CardFooter>
    </Card>
  );

  if (loading && !isRefreshing) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-4 lg:px-6">
        <div className="text-sm text-muted-foreground">
          {lastUpdated && (
            `Last updated: ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          )}
        </div>
        <Button 
          onClick={() => fetchDashboardStats(true)} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {renderStatCard(
          "Total Users",
          stats.totalUsers,
          stats.userGrowth,
          <Users className="h-4 w-4 text-blue-600" />,
          "Registered users on the platform",
          "Growing user base",
          "User growth declining"
        )}
        
        {renderStatCard(
          "Total Articles",
          stats.totalArticles,
          stats.articleGrowth,
          <FileText className="h-4 w-4 text-green-600" />,
          "Published news articles",
          "Content growing steadily",
          "Content growth needs attention"
        )}
        
        {renderStatCard(
          "Total Comments",
          stats.totalComments,
          stats.commentGrowth,
          <MessageCircle className="h-4 w-4 text-purple-600" />,
          "User interactions on articles",
          "High user engagement",
          "Engagement declining"
        )}
        
        {renderStatCard(
          "Total Views",
          stats.totalViews,
          stats.viewGrowth,
          <Eye className="h-4 w-4 text-orange-600" />,
          "Article page views this month",
          "Strong traffic growth",
          "Traffic needs improvement"
        )}
      </div>
    </div>
  );
}