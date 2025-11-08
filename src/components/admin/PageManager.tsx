// src/components/admin/PageManager.tsx
'use client';
import { useState } from 'react';
import { usePages } from '@/context/PageContext';
import { Page } from '@/types/page';
import RichTextEditor from './RichTextEditor';

export default function PageManager() {
  const { pages, categories, loading, error, addPage, updatePage, deletePage } = usePages();
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    content: '<p>Start writing your content here...</p>',
  });

  const handleSelectPage = (page: Page) => {
    setSelectedPage(page);
    setIsAddingNew(false);
    setSaveError(null);
  };

  const handleSavePage = async (content: string) => {
    if (selectedPage) {
      try {
        setIsSaving(true);
        setSaveError(null);
        await updatePage(selectedPage.id, { content });
        // Update local selected page to reflect changes
        setSelectedPage({ ...selectedPage, content, updatedAt: new Date() });
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save page');
        console.error('Error saving page:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAddPage = async () => {
    if (!newPageData.title || !newPageData.slug) {
      setSaveError('Title and slug are required');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      await addPage({
        title: newPageData.title,
        slug: newPageData.slug.toLowerCase().replace(/\s+/g, '-'),
        content: newPageData.content,
        isActive: true,
      });
      setNewPageData({ 
        title: '', 
        slug: '', 
        content: '<p>Start writing your content here...</p>' 
      });
      setIsAddingNew(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to create page');
      console.error('Error adding page:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      try {
        setIsSaving(true);
        setSaveError(null);
        await deletePage(pageId);
        if (selectedPage?.id === pageId) {
          setSelectedPage(null);
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to delete page');
        console.error('Error deleting page:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading pages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-semibold">Error loading pages</p>
          <p className="text-red-500 dark:text-red-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
      {/* Sidebar - Page List */}
      <div className="lg:w-80 w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Page Manager
            </h1>
            <button
              onClick={() => {
                setIsAddingNew(true);
                setSelectedPage(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + New Page
            </button>
          </div>

          {/* Add New Page Form */}
          {isAddingNew && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Create New Page
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Page Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., About Us"
                    value={newPageData.title}
                    onChange={(e) =>
                      setNewPageData({ ...newPageData, title: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., about-us"
                    value={newPageData.slug}
                    onChange={(e) =>
                      setNewPageData({ ...newPageData, slug: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPage}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-medium transition-colors"
                  >
                    Create Page
                  </button>
                  <button
                    onClick={() => setIsAddingNew(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories and Pages */}
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.pages.map((page) => (
                    <div
                      key={page.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedPage?.id === page.id
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleSelectPage(page)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {page.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            /{page.slug}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                page.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {page.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {page.updatedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(page.id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          title="Delete page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Editor */}
            <div className="flex-1 flex flex-col">
        {selectedPage ? (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              {saveError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{saveError}</p>
                </div>
              )}
              {isSaving && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-600 dark:text-blue-400 text-sm">Saving...</p>
                </div>
              )}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedPage.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    /{selectedPage.slug}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Updated: {selectedPage.updatedAt.toLocaleDateString()}
                  </span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPage.isActive}
                      onChange={(e) =>
                        updatePage(selectedPage.id, { isActive: e.target.checked })
                      }
                      className="rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Published
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-b-lg">
              <RichTextEditor
                content={selectedPage.content}
                onChange={handleSavePage}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center p-8">
              <div className="text-6xl mb-4 text-gray-300 dark:text-gray-600">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select a page to edit
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Choose a page from the sidebar or create a new one to start editing content
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}