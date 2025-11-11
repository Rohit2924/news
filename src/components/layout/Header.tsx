"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import DarkModeToggle from '../ui/DarkModeToggle';
import { useAuth } from '../../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { settings, loading: settingsLoading } = useSiteSettings();

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const handleLangSwitch = () => {
    // Implement language switch logic here
  };

  const categories = [
    { name: 'Home', href: '/' },
    { name: 'Politics', href: '/politics' },
    { name: 'Economy', href: '/economy' },
    { name: 'Business', href: '/business' },
    { name: 'Sports', href: '/sports' },
    { name: 'Entertainment', href: '/entertainment' },
    { name: 'International', href: '/international' },
    { name: 'Technology', href: '/technology' },
    { name: 'Health', href: '/health' },
  ];

  const isLoggedIn = auth?.isAuthenticated;
  const displayName = auth?.user?.name || '';
 const displayEmail = auth?.user?.email || '';

  return (
    <>
      <header className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-md border-b-4 border-red-600 transition-colors duration-300" id="header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src={settings?.siteLogo || "/images/fallback-logo.jpg"}
                alt="Logo"
                className="h-14 mr-4 border-2 border-red-500 rounded-lg object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/fallback-logo.jpg';
                }}
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-red-600">
                  {settings?.siteName || "News Portal"}
                </h1>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 hidden md:block">
                  {settings?.siteDescription || "Your trusted source for news"}
                </span>
              </div>
            </div>

            {/* Right Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLangSwitch}
                title="Switch Language"
                type="button"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <span className="text-sm font-medium text-black dark:text-white">EN</span>
              </button>

              <DarkModeToggle />

              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className="hidden md:inline-block px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                  Login
                </Link>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 overflow-hidden border-2 border-green-500"
                    aria-label="User menu"
                  >
                    {auth?.user?.image ? (
                      <img
                        src={auth.user.image.startsWith('/public') ? auth.user.image.substring(7) : auth.user.image}
                        alt={auth.user.name || 'Profile'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 text-gray-700 dark:text-gray-200 border-green-500" />
                    )}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-3 z-20">
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayEmail}</p>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/profile"
                          className="w-full inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <UserIcon className="h-4 w-4" />
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            auth?.logout();
                            if (typeof window !== 'undefined') {
                              fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
                                if (pathname?.startsWith('/profile')) {
                                  router.replace('/');
                                } else {
                                  router.refresh();
                                }
                              });
                            }
                          }}
                          className="w-full inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open mobile menu"
              >
                <Menu size={24} className="text-gray-700 dark:text-gray-200" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav id="main-nav" className="hidden md:block my-4 border-t pt-4">
          <ul className="flex space-x-8 justify-center">
            {categories.map((cat) => 
                <Link
                key={cat.href}
                  href={cat.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors duration-200 relative group"
                >
                  {cat.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              
            )}
          </ul>
        </nav>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden bg-white dark:bg-gray-900 fixed top-0 left-0 w-full h-full z-50 overflow-auto shadow-lg animate-fade-in"
          >
            <div className="flex justify-end p-4">
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close mobile menu">
                <X size={32} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            <ul className="flex flex-col items-center space-y-4 py-4">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    href={cat.href}
                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {/* Mobile Dark Mode Toggle */}
              <li className="w-full flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <DarkModeToggle />
              </li>
            </ul>

            {/* Search in mobile */}
            <div className="mt-4 flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 mx-4">
              <i className="fa-solid fa-search text-gray-500 mr-2"></i>
              <input
                type="text"
                placeholder="Search news..."
                className="bg-transparent outline-none flex-1 text-black dark:text-white"
                id="search-input-mobile"
              />
            </div>
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;
