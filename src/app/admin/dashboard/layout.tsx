"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../components/ui/AuthContext";
// import AdminSlider from "../components/Adminslider";
import { SidebarOpen } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  if (!auth) return null; // handle redirect or loading
  const { username, userRole, logout } = auth;



  return (
    <></>
  );
}