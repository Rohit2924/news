"use client"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconFileText,
} from "@tabler/icons-react"
import { NavMain } from "@/components/navigation/nav-main"
import { NavSecondary } from "@/components/navigation/nav-secondary"
import { NavUser } from "@/components/navigation/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavDocuments } from "./nav-documents"

// Define the data outside the component
const navSecondary = [
  {
    title: "Page Content",
    url: "/admin/pages",
    icon: IconFileText,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: IconSettings,
  },
]

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
    {
      title: "Articles",
      url: "/admin/articles",
      icon: IconFileDescription,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: IconFolder,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Comments",
      url: "/admin/comments",
      icon: IconReport,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { user: authUser, isAuthenticated } = useAuth()
  const [adminName, setAdminName] = React.useState("Admin")
  const [adminEmail, setAdminEmail] = React.useState("admin@example.com")
  
  // Check authentication and redirect if not authenticated
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
      
      // If authenticated but not admin/editor, redirect to dashboard or show access denied
      if (isAuthenticated && authUser?.role && !['ADMIN', 'EDITOR'].includes(authUser.role)) {
        router.push('/admin/dashboard?error=access_denied')
        return
      }
    }
  }, [isAuthenticated, authUser, router])

  React.useEffect(() => {
    if(authUser?.name){
      setAdminName(authUser.name)
    }
    if(authUser?.email){
      setAdminEmail(authUser.email)
    }
  }, [authUser])
  
  const displayName = adminName || adminEmail?.split('@')[0] || 'Admin'
  
  // Add isActive property to nav items based on current pathname
  const navSecondaryWithActive = navSecondary.map(item => ({
    ...item,
    isActive: pathname === item.url
  }))

  const navMainWithActive = data.navMain.map(item => ({
    ...item,
    isActive: pathname === item.url
  }))

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Checking authentication...</p>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  // Show access denied message if user doesn't have proper role
  if (isAuthenticated && authUser?.role && !['ADMIN', 'EDITOR'].includes(authUser.role)) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarContent>
          <div className="flex items-center justify-center h-32 p-4">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">⚠️</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Access Denied</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Insufficient permissions</p>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5"
            >
              <a href="/admin/dashboard">
                <IconInnerShadowTop className="size-5" />
                <span className="text-base font-semibold">{displayName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActive} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={navSecondaryWithActive} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}