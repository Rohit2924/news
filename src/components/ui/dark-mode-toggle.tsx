"use client";

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';
import { useDarkMode } from './dark-mode-context';

export function DarkModeToggle() {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      ) : (
        <Sun className="h-4 w-4 text-gray-400" />
      )}
      <span className="sr-only">Toggle dark mode</span>
    </Button>
  );
}
