import EditorLayoutWrapper from '@/components/editor/EditorLayoutWrapper';

export default function MediaLibraryPage() {
  return (
    <EditorLayoutWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Upload Media
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Placeholder media items */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-4xl">🖼️</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 truncate">image-{item}.jpg</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center text-gray-500">
            <span className="text-6xl">📁</span>
            <h3 className="mt-4 text-lg font-medium">No media files yet</h3>
            <p className="mt-2">Upload images, videos, and documents to get started.</p>
          </div>
        </div>
      </div>
    </EditorLayoutWrapper>
  );
}
