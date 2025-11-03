'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MessageCircle, Loader2, Search, Flag, ExternalLink, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  newsId: number;
  newsTitle?: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<{userId: string, commentId: string} | null>(null);
  const [reportReason, setReportReason] = useState('');


  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/comments?page=${page}&limit=10`, {
       credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setComments(data.data);
        setTotalPages(Math.ceil(data.pagination.total / data.pagination.limit));
      } else {
        toast.error(data.error || 'Failed to load comments');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page]);

  const deleteComment = async (id: string) => {
    toast(
      <div className="flex flex-col gap-3">
        <div className="font-semibold text-gray-900 dark:text-white">Delete Comment</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete this comment? This action cannot be undone.</div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                const res = await fetch(`/api/admin/comments?id=${id}`, {
                 credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                  toast.success(data.message);
                  setComments((prev) => prev.filter((c) => c.id !== id));
                } else {
                  toast.error(data.error || 'Failed to delete comment');
                }
              } catch (error) {
                console.error(error);
                toast.error('Failed to delete comment');
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        duration: 5000,
        action: {
          label: 'Delete',
          onClick: async () => {
            try {
              const res = await fetch(`/api/admin/comments?id=${id}`, {
                credentials: 'include'
              });
              const data = await res.json();
              if (data.success) {
                toast.success(data.message);
                setComments((prev) => prev.filter((c) => c.id !== id));
              } else {
                toast.error(data.error || 'Failed to delete comment');
              }
            } catch (error) {
              console.error(error);
              toast.error('Failed to delete comment');
            }
          }
        },
        cancel: {
          label: 'Cancel',
          onClick: () => {}
        }
      }
    );
  };

  const openReportDialog = (userId: string, commentId: string) => {
    setSelectedComment({ userId, commentId });
    setReportReason('');
    setReportDialogOpen(true);
  };

  const submitReport = async () => {
    if (!selectedComment || !reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    try {
      const res = await fetch('/api/admin/report-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          credentials: 'include' 
        },
        body: JSON.stringify({ 
          userId: selectedComment.userId, 
          commentId: selectedComment.commentId, 
          reason: reportReason.trim() 
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User reported successfully');
        setReportDialogOpen(false);
      } else {
        toast.error(data.error || 'Failed to report user');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to report user');
    }
  };

  const viewArticle = (newsTitle: string) => {
    if (!newsTitle) {
      toast.error('Article title not available');
      return;
    }
    
    // Create a URL-friendly slug from the title
    const slug = newsTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const articleUrl = `/articles/${slug}`;
    
    toast.success(
      <div className="flex flex-col gap-2">
        <div className="font-semibold text-gray-900 dark:text-white">Opening Article</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{newsTitle}</div>
      </div>,
      {
        duration: 3000,
        action: {
          label: 'Open Now',
          onClick: () => window.open(articleUrl, '_blank')
        }
      }
    );
  };

  const filteredComments = comments.filter((c) => {
    const title = c.newsTitle || '';
    const name = c.user?.name || '';
    const email = c.user?.email || '';
    const content = c.content || '';
    return [title, name, email, content].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                  Comments Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                  Manage user comments and interactions
                </p>
              </div>
              
              {/* Search */}
              <div className="w-full sm:w-auto sm:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search comments, users, or articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Table Container */}
          <div className="overflow-hidden">
            {/* Mobile Card View */}
            <div className="block md:hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Loading comments...</div>
                </div>
              ) : filteredComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                  <div className="text-gray-600 dark:text-gray-400 text-center">No comments found</div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredComments.map((c) => (
                    <div key={c.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {c.user?.name || 'Anonymous'}
                            </p>
                            {c.user?.email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.user.email}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => c.user?.id && openReportDialog(c.user.id, c.id)}
                              disabled={!c.user?.id}
                              className={`p-2 rounded-full transition-colors ${
                                c.user?.id 
                                  ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              }`}
                              title="Report User"
                            >
                              <Flag className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => viewArticle(c.newsTitle || '')}
                              disabled={!c.newsTitle}
                              className={`p-2 rounded-full transition-colors ${
                                c.newsTitle 
                                  ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              }`}
                              title="View Article"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteComment(c.id)}
                              className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete Comment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed break-words">
                            {c.content}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <a
                            href={`/article/${c.newsTitle?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || 'article'}`}
                            target="_blank"
                            className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[60%]"
                          >
                            {c.newsTitle || 'Untitled Article'}
                          </a>
                          <span>
                            {new Date(c.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                        <div className="text-gray-600 dark:text-gray-400">Loading comments...</div>
                      </td>
                    </tr>
                  ) : filteredComments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                        <div className="text-gray-600 dark:text-gray-400">No comments found</div>
                      </td>
                    </tr>
                  ) : (
                    filteredComments.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3 break-words">
                              {c.content}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {c.user?.name || 'Anonymous'}
                            </span>
                            {c.user?.email && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                {c.user.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`/article/${c.newsTitle?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || 'article'}`}
                            target="_blank"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm max-w-[200px] truncate block"
                          >
                            {c.newsTitle || 'Untitled'}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex flex-col">
                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => c.user?.id && openReportDialog(c.user.id, c.id)}
                              disabled={!c.user?.id}
                              className={`p-2 rounded-full transition-colors ${
                                c.user?.id 
                                  ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              }`}
                              title="Report User"
                            >
                              <Flag className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => viewArticle(c.newsTitle || '')}
                              disabled={!c.newsTitle}
                              className={`p-2 rounded-full transition-colors ${
                                c.newsTitle 
                                  ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              }`}
                              title="View Article"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteComment(c.id)}
                              className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete Comment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {!isLoading && filteredComments.length > 0 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                  Page {page} of {totalPages}
                </div>
                <div className="flex justify-center sm:justify-end space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Dialog */}
      {reportDialogOpen && selectedComment && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Flag className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Report User
              </h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for reporting
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-00 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-y"
                  placeholder="Enter reason for reporting..."
                  rows={4}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setReportDialogOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  className="w-full sm:w-auto px-4 py-2 bg-yellow-600 dark:bg-yellow-600 text-white rounded-md hover:bg-yellow-700 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}