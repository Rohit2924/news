'use client';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface PageContent {
  id: string;
  pageSlug: string;
  pageTitle: string;
  pageContent: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PageContentManagement() {
  const { isAuthenticated, user } = useAuth();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [editorMode, setEditorMode] = useState<'list' | 'edit'>('list');
  const [formData, setFormData] = useState({
    pageSlug: '',
    pageTitle: '',
    pageContent: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const userRole = user?.role;
  const hasAccess = isAuthenticated && (userRole === 'ADMIN' || userRole === 'EDITOR');

  useEffect(() => {
    if (hasAccess) {
      fetchPages();
    }
  }, [hasAccess]);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch pages');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPages(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch pages');
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setMessage('Error loading pages: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: PageContent) => {
    setEditingPage(page);
    setFormData({
      pageSlug: page.pageSlug,
      pageTitle: page.pageTitle,
      pageContent: page.pageContent,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      metaKeywords: page.metaKeywords || '',
      isActive: page.isActive
    });
    setEditorMode('edit');
  };

  const handleSave = async () => {
    if (!editingPage) return;
    
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, id: editingPage.id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update page');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Page updated successfully!');
        fetchPages();
        setTimeout(() => {
          setMessage('');
          setEditorMode('list');
          setEditingPage(null);
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to update page');
      }
    } catch (error) {
      setMessage('Error saving page: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (page: PageContent) => {
    try {
      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: page.id,
          isActive: !page.isActive,
          pageTitle: page.pageTitle,
          pageContent: page.pageContent,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          metaKeywords: page.metaKeywords
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update page');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`Page ${!page.isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchPages();
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to update page');
      }
    } catch (error) {
      setMessage('Error updating page: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleBackToList = () => {
    setEditorMode('list');
    setEditingPage(null);
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0D0D0D]">
        <div className="bg-white dark:bg-[#171717] p-8 rounded-lg shadow-lg text-center border dark:border-[#262626]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0D0D0D]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pages...</p>
        </div>
      </div>
    );
  }

  // EDITOR VIEW
  if (editorMode === 'edit') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D0D0D] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#171717] rounded-lg shadow border dark:border-[#262626] p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <button
                  onClick={handleBackToList}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2 flex items-center gap-2"
                >
                  ← Back to Pages List
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Editing: {editingPage?.pageTitle}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  URL: /{editingPage?.pageSlug}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleBackToList}
                  className="px-4 py-2 border border-gray-300 dark:border-[#262626] rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.includes('successfully') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              } border ${
                message.includes('successfully') ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Page Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Slug
                </label>
                <input
                  type="text"
                  value={formData.pageSlug}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#262626] rounded-md bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Slug cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={formData.pageTitle}
                  onChange={(e) => setFormData({...formData, pageTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#262626] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#0D0D0D] text-gray-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Content
              </label>
              <RichTextEditor
                content={formData.pageContent}
                onChange={(content) => setFormData({...formData, pageContent: content})}
              />
            </div>

            {/* SEO Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#262626] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#0D0D0D] text-gray-900 dark:text-white transition-colors"
                  placeholder="SEO Title"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#262626] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#0D0D0D] text-gray-900 dark:text-white transition-colors"
                  placeholder="SEO Description"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0D0D0D]"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Active (visible to users)
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D0D0D] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#171717] rounded-lg shadow border dark:border-[#262626]">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#262626]">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Static Pages Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your website's static pages content and SEO settings</p>
          </div>

          {message && (
            <div className={`mx-6 mt-4 p-4 rounded-md ${
              message.includes('successfully') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            } border ${
              message.includes('successfully') ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="p-6">
            {pages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pages found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Default pages need to be created in the database.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-[#262626]">
                  <thead className="bg-gray-50 dark:bg-[#1F1F1F]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Page
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#171717] divide-y divide-gray-200 dark:divide-[#262626]">
                    {pages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{page.pageTitle}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-300">/{page.pageSlug}</div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(page)}
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                              page.isActive 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-800/50' 
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-800/50'
                            }`}
                          >
                            {page.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                          {new Date(page.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <button
                            onClick={() => handleEdit(page)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4 transition-colors"
                          >
                            Edit Content
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}