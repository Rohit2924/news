"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Trash2, Calendar, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/components/ui/AuthContext";

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
}

interface CommentSectionProps {
  newsId: number;
}

export default function CommentSection({ newsId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?newsId=${newsId}`);
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.data || []);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Please log in to post a comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          newsId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.data, ...comments]);
        setNewComment("");
        toast.success("Comment posted successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Error posting comment");
    } finally {
      setSubmitting(false);
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
        setComments(comments.filter(c => c.id !== commentId));
        toast.success("Comment deleted successfully");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canDeleteComment = (comment: Comment) => {
    const currentUser = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");
    return comment.user.id === currentUser || userRole === "admin";
  };

  useEffect(() => {
    fetchComments();
  }, [newsId]);

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Comments ({comments.length})
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Share your thoughts about this article
        </p>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              disabled={submitting}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please <span className="text-blue-600 font-semibold">log in</span> to post a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No comments yet</p>
          <p className="text-gray-400 dark:text-gray-500">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {comment.user.name?.[0] || "U"}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {comment.user.name || "Anonymous"}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(comment.createdAt)}</span>
                      {comment.createdAt !== comment.updatedAt && (
                        <span className="text-xs">(edited)</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {canDeleteComment(comment) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={deleting === comment.id}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete comment"
                  >
                    {deleting === comment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}