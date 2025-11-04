// src/app/layout.tsx
"use client";

import { useEffect, useState } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header";
import FooterWrapper from "../components/layout/FooterWrapper";
import BreakingBar from "../components/common/BreakingBar";
import { AuthProvider } from "../context/AuthContext";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { useSiteSettings } from "../hooks/useSiteSettings";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const [mounted, setMounted] = useState(false);

  const isAdminRoute = pathname?.startsWith("/admin");
  const isEditorLoginRoute = pathname?.startsWith("/Editor/");
  const isEditorRoute = pathname?.startsWith("/Editor/");
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const hideChrome = isAdminRoute || isEditorRoute || isAuthRoute || isEditorLoginRoute;

  // Mark as mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update favicon dynamically
  useEffect(() => {
    if (settings?.siteFavicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = settings.siteFavicon;
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = settings.siteFavicon;
        document.head.appendChild(link);
      }
    }
  }, [settings?.siteFavicon]);

  // Don't render chrome until after hydration to prevent mismatch
  if (!mounted) {
    return (
      <html lang="en" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white transition-colors duration-300`}>
          <AuthProvider>
            <main>{children}</main>
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white transition-colors duration-300`}>
        <AuthProvider>
          {!hideChrome && <BreakingBar />}
          {!hideChrome && <Header />}
          <main>{children}</main>
          {!hideChrome && <FooterWrapper />}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}