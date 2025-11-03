"use client"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
// import { verifyJWT } from "@/lib/jwt"
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
  IconFileText, // Use Tabler's IconFileText instead of Lucide's FileText
} from "@tabler/icons-react"
// import { NavDocuments } from "@/components/navigation/nav-documents"
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
  // {
  //   title: "Page Content",
  //   url: "/admin/pages",
  //   icon: IconFileText,
  // },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: IconSettings,
  },
  // {
  //   title: "Get Help",
  //   url: "/admin",
  //   icon: IconHelp,
  // },
  // {
  //   title: "Search",
  //   url: "/admin/analytics",
  //   icon: IconSearch,
  // },
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
  documents: [
    // {
    //   name: "Data Library",
    //   url: "#",
    //   icon: IconDatabase,
    // },
    // {
    //   name: "Reports",
    //   url: "#",
    //   icon: IconReport,
    // },
    // {
    //   name: "Word Assistant",
    //   url: "#",
    //   icon: IconFileWord,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [adminName, setAdminName] = React.useState("Admin")
  const [adminEmail, setAdminEmail] = React.useState("admin@example.com")
  
  // React.useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const storedName = localStorage.getItem('username') || localStorage.getItem('name')
  //     const storedEmail = localStorage.getItem('email')
      
  //     if (storedName) {
  //       setAdminName(storedName)
  //     }
  //     if (storedEmail) {
  //       setAdminEmail(storedEmail)
  //     }
  //   }
  // }, [])

  const { user: authUser} = useAuth()
  React.useEffect(() => {
    if(authUser?.name){
      setAdminName(authUser.name)
    }
    if(authUser?.email){
      setAdminEmail(authUser.email)
    }
  }, [authUser])
  
  const displayName = adminName || adminEmail?.split('@')[0] || 'Admin'
  
  // Add isActive property to navSecondary items based on current pathname
  const navSecondaryWithActive = navSecondary.map(item => ({
    ...item,
    isActive: pathname === item.url
  }))
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{displayName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={navSecondaryWithActive} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}