// src/app/layout.tsx
"use client";

import { useEffect, useState } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import FooterWrapper from "./components/FooterWrapper";
import BreakingBar from "./components/BreakingBar";
import { AuthProvider } from "./components/ui/AuthContext";
import { usePathname } from "next/navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Removed export const metadata block as it is not allowed in client components

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode by adding/removing 'dark' class to <html>
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white transition-colors duration-300`}>
        <AuthProvider>
          {/* <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button> */}

          {!isAdminRoute && <BreakingBar />}
          {!isAdminRoute && <Header />}
            
          <main>{children}</main>

          {!isAdminRoute && <FooterWrapper />}
        </AuthProvider>
      </body>
    </html>
  );
}
