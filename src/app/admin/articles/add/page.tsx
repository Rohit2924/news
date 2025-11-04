"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FilePlus, Upload, Link, X, Loader2, Save } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface DraftData {
  title: string;
  categoryId: string;
  author: string;
  published_date: string;
  image: string;
  summary: string;
  content: string;
  tags: string;
}

// Skeleton Loading Component
const FormSkeleton = () => (
  <div className="p-6 bg-[#0D0D0D] min-h-screen">
    <div className="mb-8 mx-5">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-[#262626] rounded w-64 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-10 bg-[#262626] rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-[#262626] rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </div>
    
    <div className="bg-[#171717] rounded-lg border border-[#262626] p-6 mx-5">
      <div className="space-y-6">
        {/* Title & Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-4 bg-[#262626] rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-[#262626] rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-[#262626] rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-[#262626] rounded animate-pulse"></div>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <div className="h-4 bg-[#262626] rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-[#262626] rounded animate-pulse"></div>
        </div>

        {/* Date & Image URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-4 bg-[#262626] rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-[#262626] rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-[#262626] rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-[#262626] rounded animate-pulse"></div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <div className="h-4 bg-[#262626] rounded w-48 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-[#262626] rounded-lg animate-pulse"></div>
            <div className="h-32 bg-[#262626] rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <div className="h-4 bg-[#262626] rounded w-20 animate-pulse"></div>
          <div className="h-24 bg-[#262626] rounded animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="h-4 bg-[#262626] rounded w-24 animate-pulse"></div>
          <div className="h-48 bg-[#262626] rounded animate-pulse"></div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="h-4 bg-[#262626] rounded w-16 animate-pulse"></div>
          <div className="h-10 bg-[#262626] rounded animate-pulse"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <div className="h-10 bg-[#262626] rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-[#262626] rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-[#262626] rounded w-32 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function AddArticlePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<DraftData>({
    title: "",
    categoryId: "",
    author: "",
    published_date: new Date().toISOString().split('T')[0],
    image: "",
    summary: "",
    content: "",
    tags: ""
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('article-draft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
        if (draftData.image) {
          setImagePreview(draftData.image);
        }
        toast.info('Draft restored from previous session');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
    fetchCategories();
  }, []);

  // Auto-save when form data changes
  useEffect(() => {
    if (formData.title || formData.content) {
      const saveDraft = setTimeout(() => {
        saveToDraft();
      }, 2000);

      return () => clearTimeout(saveDraft);
    }
  }, [formData]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setFetching(false);
    }
  };

  // Save draft to localStorage
  const saveToDraft = useCallback(async () => {
    if (!formData.title && !formData.content) return;
    
    setSaving(true);
    try {
      localStorage.setItem('article-draft', JSON.stringify(formData));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  }, [formData]);

  // Manual save draft
  const handleSaveDraft = () => {
    saveToDraft();
    toast.success('Draft saved locally');
  };

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem('article-draft');
    setFormData({
      title: "",
      categoryId: "",
      author: "",
      published_date: new Date().toISOString().split('T')[0],
      image: "",
      summary: "",
      content: "",
      tags: ""
    });
    setImagePreview("");
    setLastSaved(null);
    setHasUnsavedChanges(false);
    toast.success('Draft cleared');
  };

  // Handle form data changes
  const handleFormChange = (field: keyof DraftData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData(); 
      formData.append('image', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        const uploadedUrl = data.data.imageUrl;
        handleFormChange('image', uploadedUrl);
        setImagePreview(uploadedUrl);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      handleFileUpload(file);
    }
  };

  // Handle URL input
  const handleUrlChange = (url: string) => {
    handleFormChange('image', url);
    setImagePreview(url);
  };

  // Clear image
  const clearImage = () => {
    handleFormChange('image', "");
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published' = 'published') => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate required fields for published articles
      if (status === 'published' && (!formData.title.trim() || !formData.author.trim() || !formData.content.trim() || !formData.categoryId)) {
        throw new Error('Title, author, category, and content are required to publish');
      }

      // For published articles, also require author
      if (status === 'published' && !formData.author.trim()) {
        throw new Error('Author is required to publish');
      }

      // Process tags
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          categoryId: formData.categoryId,
          author: formData.author,
          published_date: formData.published_date,
          image: formData.image,
          imageUrl: formData.image,
          summary: formData.summary,
          content: formData.content,
          tags: tagsArray,
          status: status
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || `Failed to ${status === 'draft' ? 'save draft' : 'create article'}`);
      }

      // Clear draft after successful save
      localStorage.removeItem('article-draft');
      
      if (status === 'draft') {
        toast.success('Draft saved successfully');
        router.push('/admin/articles?filter=drafts');
      } else {
        toast.success('Article published successfully');
        router.push('/admin/articles');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error(error instanceof Error ? error.message : `Failed to ${status === 'draft' ? 'save draft' : 'create article'}`);
    } finally {
      setLoading(false);
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (fetching) {
    return <FormSkeleton />;
  }

  return (
    <div className="p-6 bg-[#0D0D0D] min-h-screen">
      {/* Header with Save Status */}
      <div className="mb-8 mx-5">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FilePlus className="text-red-600" /> Add New Article
          </h2>
          <div className="flex items-center gap-4">
            {/* Save Status */}
            <div className="text-sm text-gray-400">
              {saving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : lastSaved ? (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              ) : null}
            </div>

            {/* Draft Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-3 py-2 text-sm font-medium text-gray-300 bg-[#171717] border border-[#262626] rounded-md hover:bg-[#262626] disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              
              <button
                type="button"
                onClick={clearDraft}
                className="px-3 py-2 text-sm font-medium text-red-400 bg-[#171717] border border-red-500/30 rounded-md hover:bg-red-500/10 transition-colors"
              >
                Clear Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#171717] rounded-lg border border-[#262626] p-6 mx-5">
        <form onSubmit={(e) => handleSubmit(e, 'published')} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-[#262626] rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-400 transition-colors"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Enter article title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Author *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-[#262626] rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-400 transition-colors"
                value={formData.author}
                onChange={(e) => handleFormChange('author', e.target.value)}
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-[#262626] rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white transition-colors"
              value={formData.categoryId}
              onChange={(e) => handleFormChange('categoryId', e.target.value)}
            >
              <option value="" className="text-gray-400">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id} className="text-white">
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Published Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-[#262626] rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white transition-colors"
                value={formData.published_date}
                onChange={(e) => handleFormChange('published_date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image URL (Optional)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#262626] rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-400 transition-colors"
                value={formData.image}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg (or use upload below)"
              />
            </div>
          </div>

          {/* Enhanced Image Upload Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Upload Image (Alternative to URL above)
            </label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-32 w-auto rounded-lg border border-[#262626]"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-[#262626] rounded-lg p-4 text-center bg-[#171717] transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex flex-col items-center justify-center space-y-2 p-4 hover:bg-[#262626] rounded-md disabled:opacity-50 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-300">
                    {uploading ? 'Uploading...' : 'Upload from Computer'}
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 5MB
                  </span>
                </button>
              </div>

              {/* URL Input */}
              <div className="border-2 border-[#262626] rounded-lg p-4 bg-[#171717] transition-colors">
                <div className="flex items-center mb-2">
                  <Link className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-300">Or enter URL</span>
                </div>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-[#262626] rounded-md text-sm bg-[#171717] text-white placeholder-gray-400 transition-colors"
                />
              </div>
            </div>

            {/* Current Image Display */}
            {formData.image && (
              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-300">Current image:</span>
                <div className="truncate mt-1 bg-[#262626] px-3 py-2 rounded border border-[#404040] text-gray-300">
                  {formData.image}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Summary
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-[#262626] rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-400 transition-colors"
              value={formData.summary}
              onChange={(e) => handleFormChange('summary', e.target.value)}
              placeholder="Brief summary of the article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              required
              rows={8}
              className="w-full px-3 py-2 border border-[#262626] rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-400 transition-colors"
              value={formData.content}
              onChange={(e) => handleFormChange('content', e.target.value)}
              placeholder="Article content (HTML supported)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-[#262626] rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-400 transition-colors"
              value={formData.tags}
              onChange={(e) => handleFormChange('tags', e.target.value)}
              placeholder="Comma-separated tags (e.g., tech, ai, news)"
            />
            <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-[#262626]">
            <button
              type="button"
              onClick={() => {
                if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  return;
                }
                router.back();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#171717] border border-[#262626] rounded-md hover:bg-[#262626] transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={loading || (!formData.title && !formData.content)}
              className="px-4 py-2 text-sm font-medium text-yellow-300 bg-yellow-500/20 border border-yellow-500/30 rounded-md hover:bg-yellow-500/30 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save as Draft'
              )}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </span>
              ) : (
                'Publish Article'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}