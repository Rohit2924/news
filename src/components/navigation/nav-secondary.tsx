"use client"

import * as React from "react"
import { type Icon } from "@tabler/icons-react"
import Link from "next/link"
// import { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const handleGetHelp = () => {
    // Open help documentation or support page
    window.open('/admin/settings', '_blank')
  }

  const handleSearch = () => {
    // Open search modal or redirect to search page
    window.open('/admin/analytics', '_blank')
  }

  const getActionHandler = (title: string) => {
    switch (title) {
      case 'Get Help':
        return handleGetHelp
      case 'Search':
        return handleSearch
      default:
        return null
    }
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const actionHandler = getActionHandler(item.title)
            
            if (actionHandler) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={actionHandler}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
