// app/editor/dashboard/page.tsx - Improved Dashboard with Temporary Username Feature
import { SectionCards } from '@/components/admin/section-cards';
import EditorLayoutWrapper from '@/components/editor/EditorLayoutWrapper';
import { getSession } from '@/lib/getSession';
import prisma from '@/lib/models/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MessageCircle, 
  Plus, 
  ExternalLink,
  Edit,
  Calendar,
  TrendingUp,
  AlertCircle,
  User
} from 'lucide-react';

// Define types with better precision
type AuthorData = {
  name: string;
  count: number;
};

type ArticleData = {
  id: number;
  title: string;
  createdAt: Date;
  categoryId: string;
  author: string;
  _count: {
    comments: number;
  };
};

type DashboardData = {
  userStats: {
    _count: {
      id: number;
    };
  };
  userArticles: ArticleData[];
  userComments: number;
  allAuthors: AuthorData[];
  suggestedAuthor: AuthorData | null;
  showAuthorMismatch: boolean;
  totalSystemArticles: number;
};

// Helper function for safe data fetching
async function safeFetch<T>(promise: Promise<T>, defaultValue: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error('Database query error:', error);
    return defaultValue;
  }
}

// Main dashboard component
export default async function EditorDashboard() {
  const session = await getSession();
  
  if (!session?.user) {
    return (
      <EditorLayoutWrapper>
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please log in to access the editor dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </EditorLayoutWrapper>
    );
  }

  try {
    // Fetch all necessary data in parallel where possible
    const [userStats, userArticles, userComments] = await Promise.all([
      safeFetch(
        prisma.news.aggregate({
          where: { author: session.user.name },
          _count: { id: true }
        }),
        { _count: { id: 0 } }
      ),
      safeFetch(
        prisma.news.findMany({
          where: { author: session.user.name },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { comments: true } }
          }
        }),
        []
      ),
      safeFetch(
        prisma.comment.count({
          where: {
            news: { author: session.user.name }
          }
        }),
        0
      )
    ]);

    // Initialize dashboard data
    const dashboardData: DashboardData = {
      userStats,
      userArticles,
      userComments,
      allAuthors: [],
      suggestedAuthor: null,
      showAuthorMismatch: false,
      totalSystemArticles: 0
    };

    // If user has no articles, fetch additional data
    if (userStats._count.id === 0) {
      const [authorsData, totalSystemArticles] = await Promise.all([
        safeFetch(
          prisma.news.groupBy({
            by: ['author'],
            _count: { author: true },
            orderBy: { _count: { author: 'desc' } }
          }),
          []
        ),
        safeFetch(
          prisma.news.count(),
          0
        )
      ]);
      
      dashboardData.allAuthors = authorsData.map(a => ({
        name: a.author,
        count: a._count.author
      }));

      dashboardData.totalSystemArticles = totalSystemArticles;

      // Suggest the most prolific author or a staff author
      dashboardData.suggestedAuthor = dashboardData.allAuthors.find(a => 
        a.name.toLowerCase().includes('staff') || 
        a.name.toLowerCase().includes('editor') ||
        a.name.toLowerCase().includes('reporter')
      ) || dashboardData.allAuthors[0];

      dashboardData.showAuthorMismatch = true;
    } else {
      // Fetch total system articles for users with articles
      dashboardData.totalSystemArticles = await safeFetch(
        prisma.news.count(),
        0
      );
    }

    return (
      <EditorLayoutWrapper>
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome back, {session.user.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's what's happening with your content today.
                </p>
              </div>
              <Button className="w-full sm:w-auto" asChild>
                <a href="/Editor/articles/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Article
                </a>
              </Button>
            </div>

            {/* Author Mismatch Warning */}
            {dashboardData.showAuthorMismatch && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    <AlertCircle className="h-5 w-5" />
                    No Articles Found
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-orange-700 dark:text-orange-300">
                    Your user name <strong>"{session.user.name}"</strong> doesn't match any article authors in the database.
                  </p>
                  
                  {dashboardData.suggestedAuthor && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Quick Solutions:</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Option 1:</strong> Change your profile name to match an existing author like{' '}
                          <Badge variant="outline" className="mx-1">
                            {dashboardData.suggestedAuthor.name}
                          </Badge>
                          ({dashboardData.suggestedAuthor.count} articles)
                        </div>
                        <div>
                          <strong>Option 2:</strong> Create new articles with your current name "{session.user.name}"
                        </div>
                        <div>
                          <strong>Option 3:</strong> View all articles in the system below
                        </div>
                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                          <strong>Option 4:</strong> Use a temporary username based on your email
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Temporary Username Section */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Temporary Username
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      You can use a temporary username based on your email to start creating articles immediately.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="default" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        asChild
                      >
                        <a href={`/Editor/articles/create?tempAuthor=${encodeURIComponent(session.user.name)}`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Use "{session.user.name}" as Author
                        </a>
                      </Button>
                      <Button 
                        variant="outline" 
                        asChild
                      >
                        <a href={`/Editor/articles/create?tempAuthor=${encodeURIComponent(generateTempUsername(session.user.email))}`}>
                          <User className="mr-2 h-4 w-4" />
                          Use "{generateTempUsername(session.user.email)}" as Author
                        </a>
                      </Button>
                    </div>
                  </div>

                  {dashboardData.allAuthors.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer font-medium text-orange-800 dark:text-orange-200">
                        Available Authors ({dashboardData.allAuthors.length})
                      </summary>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {dashboardData.allAuthors.slice(0, 10).map(author => (
                          <Badge key={author.name} variant="secondary" className="text-xs">
                            {author.name} ({author.count})
                          </Badge>
                        ))}
                        {dashboardData.allAuthors.length > 10 && (
                          <Badge variant="secondary" className="text-xs">
                            +{dashboardData.allAuthors.length - 10} more
                          </Badge>
                        )}
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <StatCard 
                title="Your Articles"
                value={dashboardData.userStats._count.id}
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                description="Published content"
              />
              
              <StatCard 
                title="Your Comments"
                value={dashboardData.userComments}
                icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
                description="Reader engagement"
              />
              
              <StatCard 
                title="Avg. Comments"
                value={dashboardData.userStats._count.id > 0 
                  ? Math.round(dashboardData.userComments / dashboardData.userStats._count.id)
                  : 0}
                icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
                description="Per article"
              />
              
              <StatCard 
                title="Total in System"
                value={dashboardData.totalSystemArticles}
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                description="All articles"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Recent Articles Section */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {dashboardData.userStats._count.id > 0 
                          ? 'Your Recent Articles' 
                          : 'Recent Articles (All Authors)'}
                      </CardTitle>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                        <a href="/Editor/articles">
                          View All Articles
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.userStats._count.id > 0 ? (
                      <UserArticlesList articles={dashboardData.userArticles} />
                    ) : (
                      <SystemArticlesList userName={session.user.name} />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                {/* Quick Actions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href="/Editor/articles/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Article
                      </a>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href="/Editor/articles">
                        <FileText className="mr-2 h-4 w-4" />
                        Manage Articles
                      </a>
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analytics (Soon)
                    </Button>
                  </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <StatRow 
                      label="Your Articles"
                      value={dashboardData.userStats._count.id}
                    />
                    <StatRow 
                      label="Your Engagement"
                      value={dashboardData.userComments}
                    />
                    <StatRow 
                      label="Avg. per Article"
                      value={dashboardData.userStats._count.id > 0 
                        ? Math.round(dashboardData.userComments / dashboardData.userStats._count.id)
                        : 0}
                    />
                  </CardContent>
                </Card>

                {/* User Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Account Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {session.user.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {session.user.email}
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline">
                          {session.user.role || 'EDITOR'}
                        </Badge>
                      </div>
                      {dashboardData.showAuthorMismatch && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                          <div className="font-medium text-blue-800 dark:text-blue-200">Suggested Author Name:</div>
                          <div className="text-blue-700 dark:text-blue-300">{generateTempUsername(session.user.email)}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </EditorLayoutWrapper>
    );

  } catch (error) {
    console.error('Dashboard error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return (
      <EditorLayoutWrapper>
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Dashboard Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                There was an error loading your dashboard data.
              </p>
              <p className="text-sm text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                {errorMessage}
              </p>
              <Button 
                className="w-full mt-4" 
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </EditorLayoutWrapper>
    );
  }
}

// Helper function to generate a temporary username from email
function generateTempUsername(email: string): string {
  if (!email) return "Editor";
  
  // Extract the part before @ and capitalize first letter
  const usernamePart = email.split('@')[0];
  
  // Clean up common patterns
  let cleanUsername = usernamePart
    .replace(/[._-]/g, ' ') // Replace dots, underscores, hyphens with spaces
    .replace(/\d+/g, '') // Remove numbers
    .trim();
  
  // Split into words and capitalize first letter of each
  const words = cleanUsername.split(' ').filter(word => word.length > 0);
  if (words.length === 0) return "Editor";
  
  // Capitalize first letter of each word
  const capitalizedWords = words.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
  
  // Join words and add "Editor" if it's too short
  let result = capitalizedWords.join(' ');
  if (result.length < 5) {
    result = result + " Editor";
  }
  
  return result;
}

// Reusable Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  description: string; 
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <TrendingUp className="mr-1 h-3 w-3" />
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Reusable Stat Row Component
function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {label}
      </span>
      <Badge variant="secondary">{value}</Badge>
    </div>
  );
}

// User Articles List Component
function UserArticlesList({ articles }: { articles: ArticleData[] }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No articles yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Get started by creating your first article.
        </p>
        <Button asChild>
          <a href="/Editor/articles/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Article
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles?.map((article) => (
        <div 
          key={article.id} 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-3"
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {article.title}
            </h4>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(article.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {article._count.comments} comments
              </div>
              <Badge variant="secondary" className="text-xs">
                {article.categoryId}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" asChild>
              <a href={`/Editor/articles/${article.id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a 
                href={`/news/${article.id}`} 
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// System Articles List Component
async function SystemArticlesList({ userName }: { userName: string }) {
  try {
    const recentSystemArticles = await safeFetch(
      prisma.news.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { comments: true } }
        }
      }),
      []
    );

    if (recentSystemArticles.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No articles in system
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Be the first to create an article as <strong>"{userName}"</strong>.
          </p>
          <Button asChild>
            <a href="/Editor/articles/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Article
            </a>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <strong>Note:</strong> Showing recent articles from all authors since you don't have any articles yet.
        </div>
        {recentSystemArticles?.map((article) => (
          <div 
            key={article.id} 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-3"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {article.title}
              </h4>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {article._count.comments} comments
                </div>
                <Badge variant="outline" className="text-xs">
                  by {article.author}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {article.categoryId}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" asChild>
                <a 
                  href={`/news/${article.id}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error loading system articles:', error);
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Error loading articles
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          There was a problem loading articles. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }
}
