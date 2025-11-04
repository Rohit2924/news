// /admin/articles/[id]/edit/page.tsx
"use client";
import { useState, useEffect, useRef, use } from "react";
import { FileEdit, Loader2, Upload, Link, X } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface Article {
  id: number;
  title: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author: string;
  published_date: string;
  image: string;
  imageUrl: string;
  summary: string;
  content: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    author: "",
    published_date: "",
    image: "",
    summary: "",
    content: "",
    tags: ""
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchCategories();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        const categoriesData = data.data || [];
        setCategories(categoriesData);
        await fetchArticle(categoriesData);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setFetching(false);
    }
  };

  const fetchArticle = async (categoriesList: Category[] = []) => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to load article');
        return;
      }

      const article = data.data;
      
      let categoryIdValue = "";
      
      if (article.categoryId) {
        categoryIdValue = article.categoryId.toString();
      }
      else if (article.category?.id) {
        categoryIdValue = article.category.id.toString();
      }
      else if (categoriesList.length > 0) {
        categoryIdValue = categoriesList[0].id.toString();
      }
      
      setFormData({
        title: article.title || "",
        categoryId: categoryIdValue,
        author: article.author || "",
        published_date: article.published_date || "",
        image: article.image || article.imageUrl || "",
        summary: article.summary || "",
        content: article.content || "",
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : ""
      });
      setError("");
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setFetching(false);
    }
  };

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
        const uploadedUrl = data.data.imageUrl.startsWith('http') 
          ? data.data.imageUrl 
          : `${window.location.origin}${data.data.imageUrl}`;  

        setFormData(prev => ({ 
          ...prev, 
          image: uploadedUrl 
        }));
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      handleFileUpload(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, image: "" }));
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.title.trim() || !formData.author.trim() || !formData.content.trim()) {
        throw new Error('Title, author, and content are required');
      }

      if (!formData.categoryId) {
        throw new Error('Please select a valid category');
      }

      const categoryIdValue = formData.categoryId;
      const categoryExists = categories.some(cat => cat.id.toString() === categoryIdValue.toString());
      
      if (!categoryExists) {
        throw new Error('Selected category does not exist in available categories');
      }

      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const requestData = {
        title: formData.title,
        categoryId: categoryIdValue,
        author: formData.author,
        published_date: formData.published_date,
        image: formData.image,
        imageUrl: formData.image,
        summary: formData.summary,
        content: formData.content,
        tags: tagsArray,
      };    

      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update article');
      }
      
      toast.success('Article updated successfully');
      router.push('/admin/articles');
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update article');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (fetching) {
    return (
      <div className="p-6 bg-[#0D0D0D] min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-gray-400">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#0D0D0D] min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => {
                setFetching(true);
                fetchCategories();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0D0D0D] min-h-screen">
      <div className="mb-8 mx-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileEdit className="text-red-600" /> Edit Article
        </h2>
      </div>
      
      <div className="bg-[#171717] rounded-lg shadow border border-[#262626] p-6 mx-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-[#262626] rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-500 transition-colors"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter article title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Author *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-[#262626] rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-500 transition-colors"
                value={formData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Category *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-[#262626] rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white transition-colors"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
            >
              <option value="" className="text-gray-500">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id} className="text-white">
                  {category.name}
                </option>
              ))}
            </select>
            {!formData.categoryId && (
              <p className="text-red-500 text-sm mt-1">Please select a category</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Published Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-[#262626] rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white transition-colors"
                value={formData.published_date}
                onChange={(e) => handleChange('published_date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Image URL
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-[#262626] rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-500 transition-colors"
                value={formData.image}
                onChange={(e) => handleChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Enhanced Image Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-200">
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
                  <span className="text-sm font-medium text-gray-200">
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
                  <span className="text-sm font-medium text-gray-200">Or enter URL</span>
                </div>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-[#262626] rounded-md text-sm bg-[#171717] text-white placeholder-gray-500 transition-colors"
                />
              </div>
            </div>

            {/* Current Image Display - Fixed */}
            {formData.image && (
              <div className="text-xs text-gray-400 mt-2">
                <span className="font-medium text-gray-200">Current image:</span>
                <div 
                  className="truncate mt-1 bg-[#262626] px-3 py-2 rounded border border-[#404040] text-gray-300"
                  title={formData.image}
                >
                  {formData.image}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Summary
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-[#262626] rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-500 transition-colors"
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              placeholder="Brief summary of the article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Content *
            </label>
            <textarea
              required
              rows={8}
              className="w-full px-3 py-2 border border-[#262626] rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-500 transition-colors"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Article content"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Tags
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-[#262626] rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[#171717] text-white placeholder-gray-500 transition-colors"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="Comma-separated tags (e.g., tech, ai, news)"
            />
            <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-[#262626]">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-sm font-medium text-gray-200 bg-[#171717] border border-[#262626] rounded-md hover:bg-[#262626] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.categoryId}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                'Update Article'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}