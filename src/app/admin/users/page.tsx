"use client";
import { useState } from "react";
import { Edit, Trash2, Eye, Plus, Users as UsersIcon } from "lucide-react";
import Link from "next/link";

const initialUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "user@example.com",
    role: "User",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Admin",
    email: "admin@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 3,
    name: "Alice Smith",
    email: "alice@example.com",
    role: "User",
    status: "Inactive",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);

  // Demo delete handler
  const handleDelete = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8 mx-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UsersIcon className="text-red-600" /> Users
        </h2>
        <Link href="/admin/users/add" className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 gap-2">
          <Plus size={18} /> Add User
        </Link>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-800"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                  <Link href={`/admin/users/${user.id}`} className="p-2 rounded hover:bg-gray-100 text-blue-600" title="View"><Eye size={18} /></Link>
                  <Link href={`/admin/users/${user.id}/edit`} className="p-2 rounded hover:bg-gray-100 text-yellow-600" title="Edit"><Edit size={18} /></Link>
                  <button onClick={() => handleDelete(user.id)} className="p-2 rounded hover:bg-gray-100 text-red-600" title="Delete"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 