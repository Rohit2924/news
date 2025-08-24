"use client";
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import DarkModeToggle from './ui/DarkModeToggle';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <>
      <header className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-md border-b-4 border-red-600 transition-colors duration-300" id="header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="https://nanglokhaber.com/wp-content/uploads/2023/10/cropped-Logo-1.png"
                alt="Logo"
                className="h-14 mr-4"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-red-600">Nepal News</h1>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 hidden md:block">
                  Truth and Unbiased Journalism
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

              <Link
                href="/login"
                className="hidden md:inline-block px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Login
              </Link>

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
