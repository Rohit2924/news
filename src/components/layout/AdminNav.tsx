'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BarChart2, 
  Folder, 
  FileText, 
  Users, 
  Settings, 
  MessageCircle,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const AdminNav = () => {
  const pathname = usePathname();
 const { logout, user: authUser } = useAuth();
  const router = useRouter();
  const username = authUser?.name || '';
  const email = authUser?.email || '';


  const handleLogout = () => {
    logout?.();
    router.push('/admin');
  };

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { href: '/admin/analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
    { href: '/admin/categories', label: 'Categories', icon: <Folder size={20} /> },
    { href: '/admin/articles', label: 'Articles', icon: <FileText size={20} /> },
    { href: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { href: '/admin/comments', label: 'Comments', icon: <MessageCircle size={20} /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-red-600">Admin Panel</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {links.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as:</p>
              <p className="font-medium text-gray-900 dark:text-white">{username || 'Admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-md transition-colors"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                  isActive
                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                }`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminNav;
