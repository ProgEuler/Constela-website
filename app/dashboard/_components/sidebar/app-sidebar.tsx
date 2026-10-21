"use client"

import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { APP_CONFIG } from "@/config/app-config"
import { rootUser } from "@/data/users"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { sidebarItems } from "@/navigation/sidebar-items"
import { NavGroup } from "@/navigation/sidebar-items"
import type { RoleSlug } from "@/navigation/roles"
import { getNavItemsForRole } from "@/navigation/roles"
import Image from "next/image"
import logo from "@/assets/png/logo.png"

function buildNavGroupsForRole(slug: RoleSlug): NavGroup[] {
  const items = getNavItemsForRole(slug)
  return [
    {
      id: 1,
      items: items.map((item) => ({
        title: item.title,
        url: item.url,
        icon: item.icon,
      })),
    },
  ]
}

export function AppSidebar({
  selectedRole,
  ...props
}: React.ComponentProps<typeof Sidebar> & { selectedRole?: RoleSlug }) {
  const [user, setUser] = useState<{ name: string; email: string; avatar: string }>(rootUser)
  const { isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    async function fetchUser() {
      try {
        const profile = await api.get<any>("/api/profile/me/")
        setUser({
          name: profile.user?.first_name || profile.user?.email?.split("@")[0] || "Admin",
          email: profile.user?.email || "",
          avatar: profile.photos?.[0]?.image || "",
        })
      } catch (err) {
        console.error("Failed to load user profile:", err)
      }
    }
    fetchUser()
  }, [])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                prefetch={false}
                href="/"
                onClick={() => {
                  if (isMobile) setOpenMobile(false)
                }}
              >
                {/* <Command /> */}
                <Image
                  src={logo}
                  alt="Logo"
                  width={64}
                  height={64}
                />
                <span className="text-base font-semibold">
                  {APP_CONFIG.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={
            selectedRole ? buildNavGroupsForRole(selectedRole) : sidebarItems
          }
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
