"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export default function AdminTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Authentication API', status: 'pending' },
    { name: 'Users API - List', status: 'pending' },
    { name: 'Users API - Create', status: 'pending' },
    { name: 'Articles API - List', status: 'pending' },
    { name: 'Articles API - Create', status: 'pending' },
    { name: 'Token Validation', status: 'pending' },
  ]);
  const [running, setRunning] = useState(false);

  const updateTest = (index: number, status: 'success' | 'error', message?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ));
  };

  const runTests = async () => {
    setRunning(true);
    const token = localStorage.getItem('token');

    // Test 1: Authentication API
    try {
      const response = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
      });
      const data = await response.json();
      updateTest(0, data.error ? 'error' : 'success', data.message);
    } catch (error) {
      updateTest(0, 'error', 'Network error');
    }

    // Test 2: Users API - List
    if (token) {
      try {
        const response = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        updateTest(1, data.error ? 'error' : 'success', `Found ${data.data?.length || 0} users`);
      } catch (error) {
        updateTest(1, 'error', 'Network error');
      }

      // Test 3: Users API - Create (mock test)
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Test User',
            email: 'test-' + Date.now() + '@example.com',
            role: 'user'
          })
        });
        const data = await response.json();
        updateTest(2, data.error ? 'error' : 'success', data.message);
      } catch (error) {
        updateTest(2, 'error', 'Network error');
      }

      // Test 4: Articles API - List
      try {
        const response = await fetch('/api/admin/articles', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        updateTest(3, data.error ? 'error' : 'success', `Found ${data.data?.articles?.length || 0} articles`);
      } catch (error) {
        updateTest(3, 'error', 'Network error');
      }

      // Test 5: Articles API - Create (mock test)
      try {
        const response = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: 'Test Article ' + Date.now(),
            category: 'Technology',
            author: 'Test Author',
            content: 'Test content',
            tags: ['test']
          })
        });
        const data = await response.json();
        updateTest(4, data.error ? 'error' : 'success', data.message);
      } catch (error) {
        updateTest(4, 'error', 'Network error');
      }

      // Test 6: Token Validation
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await response.json();
        updateTest(5, data.error ? 'error' : 'success', data.message);
      } catch (error) {
        updateTest(5, 'error', 'Network error');
      }
    } else {
      updateTest(1, 'error', 'No token found');
      updateTest(2, 'error', 'No token found');
      updateTest(3, 'error', 'No token found');
      updateTest(4, 'error', 'No token found');
      updateTest(5, 'error', 'No token found');
    }

    setRunning(false);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin System Test</h1>
        <p className="text-gray-600">Test all admin CRUD operations and API endpoints</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">API Tests</h2>
          <button
            onClick={runTests}
            disabled={running}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {running ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>

        <div className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{test.name}</h3>
                {test.message && (
                  <p className="text-sm text-gray-600">{test.message}</p>
                )}
              </div>
              <div>
                {test.status === 'pending' && (
                  <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                )}
                {test.status === 'success' && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                {test.status === 'error' && (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Make sure you're logged in as admin first</li>
            <li>Click "Run Tests" to test all API endpoints</li>
            <li>Green checkmarks indicate successful tests</li>
            <li>Red X marks indicate failed tests</li>
            <li>All tests should pass if the system is working correctly</li>
          </ol>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Admin Login Credentials:</h4>
            <p className="text-sm text-gray-600">Email: admin@example.com</p>
            <p className="text-sm text-gray-600">Password: admin123</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">System Status:</h4>
            <p className="text-sm text-gray-600">Database: Mock Mode (Fallback)</p>
            <p className="text-sm text-gray-600">Authentication: JWT-based</p>
          </div>
        </div>
      </div>
    </div>
  );
}