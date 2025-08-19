"use client";
import Link from "next/link";
import { Plus, Folder } from "lucide-react";

const categories = [
  { id: 1, name: "Politics", description: "Political news and updates" },
  { id: 2, name: "Business", description: "Business and economic news" },
  { id: 3, name: "Technology", description: "Latest technology trends" },
  { id: 4, name: "Sports", description: "Sports news and events" },
  { id: 5, name: "World", description: "International news" },
];

export default function CategoriesPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Folder className="text-red-600 dark:text-red-400" /> Categories
        </h2>
        <Link
          href="/admin/categories/add"
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 gap-2"
        >
          <Plus size={18} /> Add Category
        </Link>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{category.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                  {/* You can add Edit/Delete buttons here when needed */}
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-yellow-600 dark:text-yellow-400"
                    title="Edit"
                  >
                    Edit
                  </Link>
                  <button
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                    title="Delete"
                    onClick={() => alert(`Delete category ${category.name} (implement later)`)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
