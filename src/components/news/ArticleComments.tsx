'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MessageCircle, Send, Loader2, User, Edit3, Trash2, MoreVertical, Flag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  newsTitle?: string;
  isOwner?: boolean;
}

interface ArticleCommentsProps {
  newsId: number;
  articleTitle: string;
}

export default function ArticleComments({ newsId, articleTitle }: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, [newsId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?newsId=${newsId}`);
      const data = await response.json();
      if (data.success) {
        // Fixed: Accessing data.comments instead of data.data
        const commentsWithOwnership = (data.comments || []).map((comment: Comment) => ({
          ...comment,
          isOwner: comment.user.id === user?.id
        }));
        setComments(commentsWithOwnership);
      } else {
        toast.error('Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    // Validate comment length
    if (newComment.trim().length < 3) {
      toast.error('Comment must be at least 3 characters long');
      return;
    }

    if (newComment.trim().length > 1000) {
      toast.error('Comment must be less than 1000 characters');
      return;
    }

    setIsPosting(true);
    try {
      // Fixed: Added newsId as query parameter instead of in body
      const response = await fetch(`/api/comments?newsId=${newsId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Removed newsId from body, only sending content
          content: newComment.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        toast.success('Comment posted successfully');
        fetchComments(); // Refresh comments
      } else {
        toast.error(data.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsPosting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || editContent.trim().length < 3) {
      toast.error('Comment must be at least 3 characters long');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Comment updated successfully');
        setEditingComment(null);
        setEditContent('');
        fetchComments();
      } else {
        toast.error(data.error || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Comment deleted successfully');
        fetchComments();
      } else {
        toast.error(data.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <div className="mb-8">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            {/* Disable for ADMIN role */}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isAuthenticated
                  ? (user?.role?.toUpperCase() !== 'USER' ? 'Only users can comment' : 'Share your thoughts...')
                  : 'Sign in to comment'
              }
              disabled={!isAuthenticated || isPosting || (user?.role?.toUpperCase() !== 'USER')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {newComment.length}/1000 characters
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Minimum 3 characters
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isAuthenticated
                ? (user?.role?.toUpperCase() !== 'USER' ? 'Only users can comment' : 'Your comment will be visible to everyone')
                : 'Please sign in to comment'}
            </p>
            <button
              type="submit"
              disabled={!isAuthenticated || isPosting || (user?.role?.toUpperCase() !== 'USER') || !newComment.trim() || newComment.trim().length < 3}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPosting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isPosting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading comments...</span>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {comment.user?.name || comment.user?.email?.split('@')[0] || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {comment.isOwner && (
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    {comment.isOwner && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(comment)}
                          className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-1 rounded"
                          title="Edit comment"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1 rounded"
                          title="Delete comment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingComment === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                        rows={3}
                        maxLength={1000}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {editContent.length}/1000 characters
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}