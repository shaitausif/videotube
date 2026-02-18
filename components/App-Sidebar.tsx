"use client"
import { History, Home, Inbox, ListVideo, Search, Settings, ThumbsUp } from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { usePathname } from "next/navigation"





export function AppSidebar() {
  const user = useSelector((state: RootState) => state.user)
  const pathname = usePathname()


  // Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Subscriptions",
    url: `/subscription/${user._id}`, 
    icon: Inbox,
  },
  {
    title: "History",
    url: "/watch-history",
    icon: History,
  },
  {
    title: "Playlists",
    url: "/playlists",
    icon: ListVideo,
  },
  {
    title: "Liked Videos",
    url: "/liked-videos",
    icon: ThumbsUp,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]
  return (
    <Sidebar>
      <SidebarContent className="bg-white dark:bg-gray-950 border-r border-gray-200/50 dark:border-gray-800/50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={`transition-all duration-200 rounded-lg ${isActive ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 font-medium' : 'hover:bg-purple-50 dark:hover:bg-purple-500/10 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'}`}>
                    <Link href={item.url}>
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-purple-500' : ''}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}