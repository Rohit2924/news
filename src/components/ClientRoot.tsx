"use client";

import { useEffect } from "react";
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

  const isAdminRoute = pathname?.startsWith("/admin");
  const isEditorRoute = pathname?.startsWith("/Editor/");
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const hideChrome = isAdminRoute || isEditorRoute || isAuthRoute;

  useEffect(() => {
    if (settings?.siteFavicon) {
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
  }, [settings?.siteFavicon]);

  // Always render the same structure to avoid hydration mismatches
  // Use suppressHydrationWarning for client-only content
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
