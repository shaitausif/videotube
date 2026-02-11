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





export function AppSidebar() {
  const user = useSelector((state: RootState) => state.user)


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
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]
  return (
    <Sidebar >
      <SidebarContent className="dark:bg-[#161616]">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span >{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}