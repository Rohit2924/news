"use client";
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  variant?: 'desktop' | 'mobile';
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  variant = 'desktop',
  placeholder = 'Search news...'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'politics', label: 'Politics' },
    { value: 'economy', label: 'Economy' },
    { value: 'business', label: 'Business' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'international', label: 'International' },
    { value: 'technology', label: 'Technology' },
    { value: 'health', label: 'Health' },
  ];

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setHighlightedIndex(null);
        return;
      }

      setLoading(true);
      try {
        const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
        const response = await fetch(
          `/api/news?search=${encodeURIComponent(searchQuery)}&limit=5${categoryParam}`
        );
        const data = await response.json();
        setSuggestions(data.data || []);
        setHighlightedIndex(null);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // don't submit if there's no query and no category filter
    if (!searchQuery.trim() && selectedCategory === 'all') return;

    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    }
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    router.push(`/search?${params.toString()}`);
    setShowSuggestions(false);
    setHighlightedIndex(null);
  };

  const handleSuggestionClick = (newsId: number, newsTitle: string) => {
    router.push(`/article/${newsTitle}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setHighlightedIndex(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setHighlightedIndex(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setHighlightedIndex(null);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % suggestions.length;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        if (prev === null) return suggestions.length - 1;
        return (prev - 1 + suggestions.length) % suggestions.length;
      });
    } else if (e.key === 'Enter') {
      if (highlightedIndex !== null && suggestions[highlightedIndex]) {
        e.preventDefault();
        const item = suggestions[highlightedIndex];
        handleSuggestionClick(item.id, item.title);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      setHighlightedIndex(null);
    }
  };

  if (variant === 'mobile') {
    return (
      <div className="mt-4 px-4 pb-4" ref={searchRef}>
        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 border border-transparent focus-within:border-red-600 transition"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
            >
            <Search size={18} className="text-gray-500 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="bg-transparent outline-none flex-1 text-black dark:text-white text-sm"
                autoComplete="off"
                aria-label="Search news"
              />
              {loading && (
                <Loader size={16} className="mr-1 text-gray-400 animate-spin shrink-0" />
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
              disabled={!searchQuery.trim() && selectedCategory === 'all'}
            >
              Search
            </button>
          </div>

          {/* Category filter for mobile */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-2 w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border-0 outline-none text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Suggestions dropdown for mobile */}
          {showSuggestions && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              {loading && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  <Loader size={16} className="animate-spin" />
                  <span>Searching...</span>
                </div>
              )}
              {!loading && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No results found
                </div>
              )}
              {!loading && suggestions.length > 0 && suggestions.map((news, index) => (
                <button
                  key={news.id}
                  type="button"
                  onClick={() => handleSuggestionClick(news.id, news.title)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition ${
                    highlightedIndex === index
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {news.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {news.summary || news.content?.substring(0, 60)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    );
  }

  // Desktop variant
  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <div
            className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 border border-transparent hover:border-red-500 focus-within:border-red-600 transition"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
          >
            <Search size={18} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="bg-transparent outline-none flex-1 text-gray-900 dark:text-white text-sm"
              autoComplete="off"
              aria-label="Search news"
            />
            {loading && (
              <Loader size={16} className="ml-1 text-gray-400 animate-spin shrink-0" />
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Desktop suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
              <div className="p-2" role="listbox">
                {loading && (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader size={16} className="animate-spin" />
                    <span>Searching...</span>
                  </div>
                )}
                {!loading && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No results found
                  </div>
                )}
                {!loading && suggestions.length > 0 && suggestions.map((news, index) => (
                  <button
                    key={news.id}
                    type="button"
                    onClick={() => handleSuggestionClick(news.id, news.title)}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      highlightedIndex === index
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    role="option"
                    aria-selected={highlightedIndex === index}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      {news.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {news.summary || news.content?.substring(0, 80)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category select - Desktop */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border-0 outline-none hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition cursor-pointer"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2"
          disabled={!searchQuery.trim() && selectedCategory === 'all'}
        >
          <Search size={18} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
