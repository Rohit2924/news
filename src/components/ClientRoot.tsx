"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/layout/Header";
import FooterWrapper from "../components/layout/FooterWrapper";
import BreakingBar from "../components/common/BreakingBar";
import { useSiteSettings } from "../hooks/useSiteSettings";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const [isMounted, setIsMounted] = useState(false);

  // Determine route types
  const isAdminRoute = pathname?.startsWith("/admin");
  const isEditorRoute = pathname?.startsWith("/editor");
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isUserProfileRoute = pathname?.startsWith("/profile");
  const hideChrome = isAdminRoute || isEditorRoute || isAuthRoute || isUserProfileRoute;

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update favicon
  useEffect(() => {
    if (settings?.siteFavicon && isMounted) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = settings.siteFavicon;
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = settings.siteFavicon;
        document.head.appendChild(link);
      }
    }
  }, [settings?.siteFavicon, isMounted]);

  

  // Don't render anything until mounted to avoid hydration mismatches
  if (!isMounted) {
    return (
      <AuthProvider>
        <main suppressHydrationWarning>{children}</main>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      {!hideChrome && <BreakingBar />}
      {!hideChrome && <Header />}
      <main suppressHydrationWarning>{children}</main>
      {!hideChrome && <FooterWrapper />}
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}