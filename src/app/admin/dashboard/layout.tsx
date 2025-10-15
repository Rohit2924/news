"use client";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  if (!auth) return null;

  // Middleware already guards roles; just render the dashboard content
  return (
    <>{children}</>
  );
}