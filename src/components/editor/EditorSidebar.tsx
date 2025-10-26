'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function EditorSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { href: '/Editor/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/Editor/articles', label: 'Articles', icon: '📝', submenu: [
      { href: '/Editor/articles', label: 'All Articles' },
      { href: '/Editor/articles/create', label: 'Add New' },
      { href: '/Editor/articles/categories', label: 'Categories' }
    ]},
    { href: '/Editor/media', label: 'Media Library', icon: '🖼️' },
    { href: '/Editor/comments', label: 'Comments', icon: '💬' },
    { href: '/Editor/users', label: 'Users', icon: '👥' },
    { href: '/Editor/analytics', label: 'Analytics', icon: '📈' },
    { href: '/Editor/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className={`bg-gray-900 text-white h-full transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold">Editor Panel</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded hover:bg-gray-700"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        {menuItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
                pathname === item.href ? 'bg-blue-600' : ''
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
            
            {/* Submenu */}
            {item.submenu && !isCollapsed && pathname.startsWith('/Editor/articles') && (
              <div className="ml-8 border-l border-gray-600">
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`block px-4 py-2 text-sm hover:bg-gray-700 ${
                      pathname === subItem.href ? 'bg-gray-600' : ''
                    }`}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Info */}
      {!isCollapsed && (
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Editor Mode</span>
            <a
              href="/api/auth/logout"
              className="text-sm text-red-400 hover:text-red-300"
            >
              Logout
            </a>
          </div>
        </div>
      )}
    </div>
  );
}