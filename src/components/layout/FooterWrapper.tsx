"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/profile") || pathname.startsWith("/admin");
  if (isAuthPage) return null;
  return <Footer />;
} 