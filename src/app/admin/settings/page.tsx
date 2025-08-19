"use client";
import React from "react";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-8 mx-5">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your admin preferences and account settings here.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-5">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" placeholder="+977-XXXXXXXXXX" />
          </div>
          <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700 transition">Save Changes</button>
        </form>
      </div>
    </div>
  );
}
