"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MessageCircle, 
  Trash2, 
  Eye, 
  User, 
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  news: {
    id: number;
    title: string;
  };
}

interface CommentsResponse {
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const router = useRouter();

  const fetchComments = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in as admin");
        router.push("/admin");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/comments?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: CommentsResponse = await response.json();
        setComments(data.data);
        setPagination(data.pagination);
      } else {
        toast.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Error fetching comments");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      setDeleting(commentId);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Comment deleted successfully");
        fetchComments(currentPage, searchTerm);
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Error deleting comment");
    } finally {
      setDeleting(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComments(1, searchTerm);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchComments(newPage, searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Comments Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and moderate user comments across all articles
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Comments List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Comments ({pagination.total})
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-4 w-4" />
                Page {pagination.page} of {pagination.totalPages}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No comments found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {comments.map((comment) => (
                <div key={comment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Comment Content */}
                      <div className="mb-4">
                        <p className="text-gray-900 dark:text-white leading-relaxed">
                          {comment.content}
                        </p>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {comment.user.name || "Anonymous"}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({comment.user.email})
                          </span>
                        </div>
                      </div>

                      {/* Article Info */}
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Article: {comment.news.title}
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleting === comment.id}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete comment"
                      >
                        {deleting === comment.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} comments
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}