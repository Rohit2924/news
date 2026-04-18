"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const limit = 10;

  useEffect(() => {
    const fetchResults = async () => {
      // fetch when there is either a query or a category filter
      if (!query.trim() && !category) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set('search', query);
        params.set('page', page.toString());
        params.set('limit', limit.toString());
        if (category) params.set('category', category);

        const response = await fetch(`/api/news?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setResults(data.data);
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        } else {
          setError('Failed to fetch search results');
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('An error occurred while searching');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, page]);

  if (!query.trim() && !category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          No Search Query
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Please enter a search term or select a category to browse articles.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Info */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Search Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {loading ? (
            'Searching...'
          ) : (
            <>
              Found <span className="font-bold text-red-600">{total}</span> result
              {total !== 1 ? 's' : ''}
              {query && (
                <>
                  {' '}for <span className="font-bold text-gray-900 dark:text-white">"{query}"</span>
                </>
              )}
              {category && (
                <>
                  {' '}
                  in <span className="font-bold text-gray-900 dark:text-white">{category}</span>
                </>
              )}
            </>
          )}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader className="animate-spin text-red-600" size={48} />
          <span className="ml-4 text-gray-600 dark:text-gray-400">Searching...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          <div className="grid gap-6 mb-8">
            {results.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.title}`}
                className="group block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition duration-300"
              >
                <div className="lg:flex">
                  {article.image || article.imageUrl ? (
                    <div className="lg:w-1/4 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={article.imageUrl || article.image}
                        alt={article.title}
                        className="h-48 lg:h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : null}
                  <div className="p-6 lg:flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full uppercase">
                          {article.category?.name || 'News'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(article.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {article.summary || article.content?.substring(0, 150)}
                      </p>
                    </div>
                    <div className="mt-4 text-sm text-red-600 dark:text-red-400 font-medium group-hover:gap-2 flex items-center transition">
                      Read More →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 rounded-lg transition ${
                      page === pageNum
                        ? 'bg-red-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && !error && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Results Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We couldn't find any news articles matching your search. Try different keywords or browse our categories.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Back to Home
            </Link>
            <Link
              href="/politics"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><Loader className="animate-spin text-red-600 mx-auto" size={48} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
