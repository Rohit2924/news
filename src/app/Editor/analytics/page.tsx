import EditorLayoutWrapper from '@/components/editor/EditorLayoutWrapper';
import { getSession } from '@/lib/getSession';
import prisma from '@/lib/models/prisma';

export default async function AnalyticsPage() {
  const session = await getSession();
  
  const analytics = await prisma.analyticsEvent.findMany({
    where: {
      OR: [
        { eventType: 'page_view' },
        { eventData: { path: { contains: '/news/' } } }
      ]
    },
    take: 100,
    orderBy: { createdAt: 'desc' }
  });

  const articleStats = await prisma.news.findMany({
    where: { author: session?.user.name },
    select: {
      title: true,
      createdAt: true,
      _count: { select: { comments: true } }
    },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <EditorLayoutWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Views/Article</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {articleStats.length > 0 ? Math.round(analytics.length / articleStats.length) : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {articleStats.reduce((sum, article) => sum + article._count.comments, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth</p>
                <p className="text-2xl font-semibold text-green-600">+12%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Articles */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Article Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {articleStats.map((article, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{article.title}</h4>
                    <p className="text-sm text-gray-600">
                      Published {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{article._count.comments}</p>
                    <p className="text-sm text-gray-600">comments</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics.slice(0, 10).map((event, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {event.eventType} • {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EditorLayoutWrapper>
  );
}
