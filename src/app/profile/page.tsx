"use client";
import { useState, useEffect, useRef } from "react";
import { toast as notify } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  Check,
  User,
  Loader2,
  AlertCircle,
  Save,
  Edit3,
  Phone,
  Mail,
  X,
  Sparkles,
  MessageCircle,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// --- INTERFACES ---
interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string | null;
  contactNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  reputation?: number;
}

interface Comment {
  id: string | number;
  content: string;
  createdAt: string;
  newsId: number;
  news?: {
    id: number;
    title: string;
    category: string;
  };
}

export default function Profile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profileUpdateErrors, setProfileUpdateErrors] = useState<{
    name?: string;
    contactNumber?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Comment editing state
  const [editingComment, setEditingComment] = useState<{
    id: string | number;
    content: string;
  } | null>(null);
  const [commentEditLoading, setCommentEditLoading] = useState(false);
  
  // Get auth context
  const { isAuthenticated, user: authUser, logout } = useAuth();
  const [dark, setDark] = useState<boolean>(false);
  
  // Theme toggle
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const isDark = saved === 'dark' || (!saved && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(!!isDark);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);
  
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
    }
  };
  
  // Format image URL
  const formatImageUrl = (url: string | null | undefined) => {
    if (!url) return "";
    return url.startsWith("/public") ? url.substring(7) : url;
  };
  
  // ✅ SECURE: Centralized API call function with credentials: 'include'
  const secureApiCall = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    return fetch(endpoint, {
      ...options,
      credentials: 'include', // Always include httpOnly cookie
      headers: {
        ...options.headers,
        // Don't add Authorization header - the cookie is sent automatically
      },
    });
  };

  
  
  // Fetch user profile
  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      router.replace('/login');
      return;
    }

    // Use authUser data directly from context
    const userProfile: UserProfile = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name || "",
      role: authUser.role,
      image: authUser.image,
      // contactNumber: authUser.contactNumber ,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reputation: 0,
    };

    setUser(userProfile);
    setFormData({
      name: userProfile.name || "",
      email: userProfile.email || "",
      contactNumber: userProfile.contactNumber || "",
      image: userProfile.image || "",
    });
    setIsFetching(false);

    // Load comments
    loadComments();
  }, [isAuthenticated, authUser, router]);
  
  // ✅ SECURE: Load comments with credentials: 'include'
  const loadComments = async () => {
    if (!isAuthenticated || !authUser) return;
    
    try {
      setLoadingComments(true);
      
      const res = await secureApiCall('/api/comments?mode=user', {
        method: 'GET',
      });
      
      const data = await res.json();
  
      if (data.success && data.data?.comments) {
        setComments(data.data.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setProfileUpdateErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  
  // Clean up image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        notify.error("Image too large", {
          description: "Please select an image smaller than 5MB",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        notify.error("Invalid file type", {
          description: "Please select an image file",
        });
        return;
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };
  
  // Drag and drop handlers
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        notify.error("Image too large (max 5MB)");
        return;
      }
      
      if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) {
        notify.error("Only JPEG, PNG, GIF, and WebP images are allowed");
        return;
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const errors: { name?: string; contactNumber?: string } = {};
    
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      errors.name = "Name is required";
    } else if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (trimmedName.length > 100) {
      errors.name = "Name must be less than 100 characters";
    }
    
    if (formData.contactNumber) {
      const cleaned = formData.contactNumber.replace(/\D/g, "");
      if (cleaned.length < 7 || cleaned.length > 15) {
        errors.contactNumber = "Phone number must be 7-15 digits";
      }
    }
    
    setProfileUpdateErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // ✅ SECURE: Logout with httpOnly cookie
  const handleLogout = async () => {
    try {
      const loadingToast = notify.loading('Logging out...');
      
      await secureApiCall('/api/auth/logout', { method: 'POST' });
      
      await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
    });

      if (logout) {
        await logout();
      }
      
      notify.dismiss(loadingToast);
      notify.success('Logged out successfully');

       if (typeof window !== 'undefined') {
      localStorage.removeItem('theme');
    }

      router.replace('/login');
    } catch (error) {
      notify.error('Logout failed', { description: 'Please try again' });
    }
  };
  
  // ✅ SECURE: Delete account
  const handleDeleteAccount = async () => {
    if (!isAuthenticated || !authUser) {
      notify.error("Authentication required");
      return;
    }
    
    notify("⚠️ Delete Account?", {
      description: "This action is IRREVERSIBLE. All your data will be permanently deleted.",
      action: {
        label: "Delete Forever",
            onClick: async () => {
          const loadingToast = notify.loading('Deleting account...');
          try {
            const res = await secureApiCall('/api/customer/profile', {
              method: 'DELETE',
               credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
            });
            
            const data = await res.json();
            
            notify.dismiss(loadingToast);
            
            if (!res.ok || data.error) {
              notify.error('Deletion failed', { 
                description: data.message || data.error || 'Please try again' 
              });
              return;
            }
            
            // Clear all local data
           if (typeof window !== 'undefined') {
               localStorage.removeItem('theme');
}
            
            notify.success('Account deleted', { 
              description: 'Your account has been permanently deleted.' 
            });
            
            setTimeout(() => router.replace('/'), 800);
          } catch (e) {
            notify.dismiss(loadingToast);
            notify.error('Deletion failed', { 
              description: 'Network error. Please try again' 
            });
          }
        }
      },
      cancel: { label: 'Cancel', onClick: () => {} },
      duration: 15000,
    });
  };
  
  // ✅ SECURE: Profile update
  const handleProfileUpdate = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    
    if (!validateProfileForm()) {
      return;
    }
    
    if (!isAuthenticated || !authUser) {
      notify.error("Authentication required");
      return;
    }
    
    setLoading(true);
    const loadingToast = notify.loading('Updating profile...');
    
    try {
      const response = await secureApiCall('/api/customer/profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          contactNumber: formData.contactNumber?.trim() || null,
          fullname: authUser?.name,
          email: authUser?.email,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.message || data.error || 'Update failed');
      }
      
      setUser((prev) => ({
        ...prev!,
        name: formData.name.trim(),
        contactNumber: formData.contactNumber?.trim() || null,
      }));
      setIsEditing(false);
      
      notify.dismiss(loadingToast);
      notify.success("Profile updated successfully");
    } catch (error) {
      notify.dismiss(loadingToast);
      notify.error('Update failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // ✅ SECURE: Image upload with auth context update
  const handleImageUpload = async () => {
    if (!imageFile) {
      notify.error("No image selected");
      return;
    }
    
    if (!isAuthenticated || !authUser) {
      notify.error("Authentication required");
      return;
    }
    
    setLoading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("image", imageFile);
    const loadingToast = notify.loading('Uploading image...');
    
    try {
      const response = await secureApiCall('/api/customer/change-image', {
        method: 'POST',
        body: uploadFormData,
        // Note: Don't set Content-Type header for FormData - browser sets it with boundary
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.message || data.error || 'Upload failed');
      }
      
      // The API now returns full updated user data
      if (data.data?.user) {
        // Update local user state
        setUser((prev) => ({
          ...prev!,
          ...data.data.user
        }));

        // Force refresh auth context by calling /api/auth/me
        await secureApiCall('/api/auth/me');
      }

      setImageFile(null);
      setImagePreview(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      
      notify.dismiss(loadingToast);
      notify.success("Profile image updated");
    } catch (error) {
      notify.dismiss(loadingToast);
      notify.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Comment edit functions
  const startEditingComment = (comment: Comment) => {
    setEditingComment({
      id: comment.id,
      content: comment.content,
    });
  };
  
  const cancelEditingComment = () => {
    setEditingComment(null);
  };
  
  const handleCommentEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editingComment) {
      setEditingComment({
        ...editingComment,
        content: e.target.value,
      });
    }
  };
  
  // ✅ SECURE: Save comment edit
  const saveCommentEdit = async () => {
    if (!editingComment || !isAuthenticated) return;
    
    // Validate comment content
    const trimmedContent = editingComment.content.trim();
    if (!trimmedContent) {
      notify.error("Comment cannot be empty");
      return;
    }
    
    if (trimmedContent.length > 5000) {
      notify.error("Comment is too long (max 5000 characters)");
      return;
    }
    
    setCommentEditLoading(true);
    
    try {
      const response = await secureApiCall(`/api/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: trimmedContent,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === editingComment.id
              ? { ...comment, content: trimmedContent }
              : comment
          )
        );
        
        notify.success("Comment updated successfully");
        setEditingComment(null);
      } else {
        notify.error("Failed to update comment", { 
          description: data.error || data.message || 'Please try again' 
        });
      }
    } catch (error) {
      notify.error("Failed to update comment", { 
        description: 'Network error. Please try again' 
      });
    } finally {
      setCommentEditLoading(false);
    }
  };
  
  // ✅ SECURE: Delete comment
  const handleDeleteComment = async (commentId: string | number) => {
    if (!isAuthenticated) return;
    
    notify("Delete Comment?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const response = await secureApiCall(`/api/comments/${commentId}`, {
              method: 'DELETE',
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
              setComments(prevComments => 
                prevComments.filter(comment => comment.id !== commentId)
              );
              notify.success("Comment deleted successfully");
            } else {
              notify.error("Failed to delete comment", { 
                description: data.error || data.message || 'Please try again' 
              });
            }
          } catch (error) {
            notify.error("Failed to delete comment", { 
              description: 'Network error. Please try again' 
            });
          }
        }
      },
      cancel: { label: 'Cancel', onClick: () => {} },
      duration: 10000,
    });
  };
  
  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="min-h-screen md:mt-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg">
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
              <div className="h-4 w-4 rounded-full bg-blue-400 animate-pulse" />
              <div className="h-4 w-28 bg-gray-300 dark:bg-gray-500 rounded-lg animate-pulse" />
            </div>
            <div className="h-10 w-56 bg-gray-200 dark:bg-gray-600 rounded-lg mx-auto mb-3 animate-pulse" />
            <div className="h-5 w-72 bg-gray-200 dark:bg-gray-600 rounded-lg mx-auto animate-pulse" />
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="text-center mb-8">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-600 rounded-lg mx-auto mb-3 animate-pulse" />
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-600 rounded-lg mx-auto animate-pulse" />
                  </div>
                  
                  <div className="relative mx-auto mb-8">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 animate-pulse mx-auto" />
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-blue-500 animate-pulse border-4 border-white dark:border-gray-800" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-12 w-full bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse" />
                    <div className="h-12 w-full bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <div className="h-5 w-5 bg-blue-500 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse" />
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-3 animate-pulse" />
                      <div className="h-14 w-full bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse border border-gray-200 dark:border-gray-600" />
                    </div>
                    <div>
                      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-600 rounded mb-3 animate-pulse" />
                      <div className="h-14 w-full bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse border border-gray-200 dark:border-gray-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-end gap-4">
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse" />
              <div className="h-12 w-40 bg-blue-500 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (isFetching) {
    return <LoadingSkeleton />;
  }
  
  if (!isAuthenticated || !authUser) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen md:mt-16 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to load your profile</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen md:mt-16 mb-20">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
          
          {user && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                {user.role?.toUpperCase()}
              </span>
              
              {user.reputation !== undefined && (
                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    {user.reputation} pts
                  </span>
                </div>
              )}
              
              {user.role !== 'ADMIN' && (
                <button
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Delete account
                </button>
              )}
              
              <button
                onClick={toggleDark}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {dark ? '☀️ Light' : '🌙 Dark'}
              </button>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        
        {/* Main profile card */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 shadow-xl">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <div className="">
                  <div className="text-center mb-4">
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Profile photo</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isEditing ? "Upload a new photo (max 5MB)" : "Your profile picture"}
                    </p>
                  </div>
                  
                  <div
                    className={`relative rounded-xl border-2 ${dragActive ? 'border-blue-500 border-solid' : 'border-dashed border-gray-300 dark:border-gray-700'} p-4 transition-colors ${isEditing ? 'cursor-pointer hover:border-gray-400' : 'pointer-events-none'}`}
                    onDragEnter={isEditing ? handleDragEnter : undefined}
                    onDragLeave={isEditing ? handleDragLeave : undefined}
                    onDragOver={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation(); } }}
                    onDrop={isEditing ? handleDrop : undefined}
                    onClick={() => isEditing && fileInputRef.current?.click()}
                  >
                    <div className="relative mx-auto w-40 h-40 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-lg">
                      {imagePreview || user?.image ? (
                        <Image
                          src={imagePreview || `${formatImageUrl(user.image)}?t=${new Date().getTime()}`}
                          alt={user?.name || "User"}
                          sizes="160px"
                          fill
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-5xl font-bold bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                      {dragActive ? "📥 Drop to upload" : isEditing ? "📷 Click or drag to upload" : "Edit profile to change photo"}
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                      ref={fileInputRef}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  {imageFile && isEditing && (
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={handleImageUpload}
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Upload photo
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setImageFile(null);
                          if (imagePreview) URL.revokeObjectURL(imagePreview);
                          setImagePreview(null);
                        }}
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Personal information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Full name <span className="text-red-500">*</span>
                      </span>
                      <div className="relative">
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing || loading}
                          maxLength={100}
                          className={`w-full px-3 py-2 rounded-md border ${
                            profileUpdateErrors.name 
                              ? 'border-red-300 dark:border-red-700' 
                              : 'border-gray-300 dark:border-gray-700'
                          } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition-colors`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {profileUpdateErrors.name && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {profileUpdateErrors.name}
                        </p>
                      )}
                    </label>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Contact</h3>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-1">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Email</span>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          disabled={true}
                          className="w-full pl-11 pr-3 py-2 rounded-md border border-gray-300 bg-gray-100 dark:bg-gray-900 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          placeholder="Email"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Email cannot be changed for security reasons
                      </p>
                    </label>
                    
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Phone</span>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          name="contactNumber"
                          type="tel"
                          value={formData.contactNumber || ""}
                          onChange={handleInputChange}
                          disabled={!isEditing || loading}
                          maxLength={20}
                          className={`w-full pl-11 pr-3 py-2 rounded-md border ${
                            profileUpdateErrors.contactNumber 
                              ? 'border-red-300 dark:border-red-700' 
                              : 'border-gray-300 dark:border-gray-700'
                          } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition-colors`}
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      {profileUpdateErrors.contactNumber && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {profileUpdateErrors.contactNumber}
                        </p>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comments section */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-6 px-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Your comments</h3>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {loadingComments ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No comments yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Start commenting on articles to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => {
                  const news = comment.news;
                  const slug = news?.title ? 
                    news.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') : 
                    String(news?.id || comment.newsId);
                  
                  const isEditingThis = editingComment?.id === comment.id;
                  
                  return (
                    <div key={comment.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                      {isEditingThis ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingComment.content}
                            onChange={handleCommentEditChange}
                            maxLength={5000}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900 min-h-[100px] resize-y"
                            placeholder="Edit your comment..."
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {editingComment.content.length}/5000 characters
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={cancelEditingComment}
                                disabled={commentEditLoading}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveCommentEdit}
                                disabled={commentEditLoading || !editingComment.content.trim()}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {commentEditLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                    Saving...
                                  </>
                                ) : (
                                  "Save"
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <a 
                              href={`/article/${slug}`} 
                              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors line-clamp-2"
                            >
                              {news?.title || `Article #${news?.id || comment.newsId}`}
                            </a>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
                              {comment.content}
                            </p>
                            
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <a 
                              href={`/article/${slug}`} 
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              View Article
                            </a>
                            
                            <div className="relative group">
                              <button 
                                className="inline-flex items-center p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                              
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 hidden group-hover:block">
                                <button 
                                  onClick={() => startEditingComment(comment)} 
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit3 className="h-4 w-4 inline mr-2" />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteComment(comment.id)} 
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Trash2 className="h-4 w-4 inline mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ 
                    name: user.name || "", 
                    email: user.email || "", 
                    contactNumber: user.contactNumber || "", 
                    image: user.image || "" 
                  });
                  setProfileUpdateErrors({});
                  setImageFile(null);
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImagePreview(null);
                }}
                disabled={loading}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </button>
            )}
            <button
              onClick={handleProfileUpdate}
              disabled={loading}
              className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </>
              ) : (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}