import EditorLayoutWrapper from '@/components/editor/EditorLayoutWrapper';
import { getSession } from '@/lib/getSession';
import prisma from '@/lib/models/prisma';

export default async function CommentsPage() {
  const session = await getSession();
  
  const comments = await prisma.comment.findMany({
    where: {
      news: { author: session?.user.name }
    },
    include: {
      user: { select: { name: true, email: true } },
      news: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <EditorLayoutWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Comments</h2>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <button className="text-blue-600 font-medium">All ({comments.length})</button>
              <button className="text-gray-600">Pending (0)</button>
              <button className="text-gray-600">Approved ({comments.length})</button>
              <button className="text-gray-600">Spam (0)</button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{comment.user.name}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      on <span className="font-medium">{comment.news.title}</span>
                    </p>
                    <p className="text-gray-900 mt-2">{comment.content}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="text-green-600 hover:text-green-800 text-sm">Approve</button>
                    <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl">💬</span>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No comments yet</h3>
              <p className="mt-2 text-gray-600">Comments on your articles will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </EditorLayoutWrapper>
  );
}
