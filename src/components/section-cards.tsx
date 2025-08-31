"use client";

import { useState, useEffect } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AdminStats {
  totalUsers: number;
  totalNews: number;
  totalComments: number;
  newUsersThisMonth: number;
  newCommentsThisWeek: number;
  userGrowthRate: string;
  commentGrowthRate: string;
}

export function SectionCards() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.totalUsers || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {stats?.userGrowthRate || "+0%"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            New users this month: {stats?.newUsersThisMonth || 0} <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            User registration tracking
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Articles</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.totalNews || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Content library growing <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Published news articles
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Comments</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.totalComments || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {stats?.commentGrowthRate || "+0%"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            New comments this week: {stats?.newCommentsThisWeek || 0} <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">User engagement metrics</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Engagement Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.totalComments && stats?.totalUsers 
              ? ((stats.totalComments / stats.totalUsers) * 100).toFixed(1) + "%"
              : "0%"
            }
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +2.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Comments per user ratio <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Community interaction level</div>
        </CardFooter>
      </Card>
    </div>
  )
}
