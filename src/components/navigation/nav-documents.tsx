"use client"

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  IconDownload,
  IconEye,
  type Icon,
} from "@tabler/icons-react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
}) {
  const { isMobile } = useSidebar()

  const handleDataLibrary = () => {
    // Navigate to data library page or open data export modal
    window.open('/admin/analytics', '_blank')
  }

  const handleReports = () => {
    // Generate and download reports
    const reportData = {
      users: 'User statistics and analytics',
      articles: 'Article performance metrics',
      comments: 'Comment moderation reports',
      system: 'System health and performance'
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleWordAssistant = () => {
    // Open AI writing assistant or redirect to article creation
    window.open('/admin/articles/add', '_blank')
  }

  const getActionHandler = (name: string) => {
    switch (name) {
      case 'Data Library':
        return handleDataLibrary
      case 'Reports':
        return handleReports
      case 'Word Assistant':
        return handleWordAssistant
      default:
        return () => {}
    }
  }

  return (
    <>
    </>
    // <SidebarGroup className="group-data-[collapsible=icon]:hidden">
    //   <SidebarGroupLabel>Documents</SidebarGroupLabel>
    //   <SidebarMenu>
    //     {items.map((item) => (
    //       <SidebarMenuItem key={item.name}>
    //         <SidebarMenuButton asChild>
    //           <button onClick={getActionHandler(item.name)} className="w-full text-left">
    //             <item.icon />
    //             <span>{item.name}</span>
    //           </button>
    //         </SidebarMenuButton>
    //         <DropdownMenu>
    //           <DropdownMenuTrigger asChild>
    //             <SidebarMenuAction
    //               showOnHover
    //               className="data-[state=open]:bg-accent rounded-sm"
    //             >
    //               <IconDots />
    //               <span className="sr-only">More</span>
    //             </SidebarMenuAction>
    //           </DropdownMenuTrigger>
    //           <DropdownMenuContent
    //             className="w-24 rounded-lg"
    //             side={isMobile ? "bottom" : "right"}
    //             align={isMobile ? "end" : "start"}
    //           >
    //             <DropdownMenuItem onClick={getActionHandler(item.name)}>
    //               <IconEye />
    //               <span>Open</span>
    //             </DropdownMenuItem>
    //             <DropdownMenuItem onClick={getActionHandler(item.name)}>
    //               <IconDownload />
    //               <span>Download</span>
    //             </DropdownMenuItem>
    //             <DropdownMenuSeparator />
    //             <DropdownMenuItem variant="destructive">
    //               <IconTrash />
    //               <span>Delete</span>
    //             </DropdownMenuItem>
    //           </DropdownMenuContent>
    //         </DropdownMenu>
    //       </SidebarMenuItem>
    //     ))}
    //     <SidebarMenuItem>
    //       <SidebarMenuButton className="text-sidebar-foreground/70">
    //         {/* <IconDots className="text-sidebar-foreground/70" /> */}
    //         {/* <span>More</span> */}
    //       </SidebarMenuButton>
    //     </SidebarMenuItem>
    //   </SidebarMenu>
    // </SidebarGroup>
  )
}
