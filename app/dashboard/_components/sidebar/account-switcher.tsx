"use client"

import { useState, useEffect } from "react"

import { BadgeCheck, Bell, Check, LogOut } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn, getInitials } from "@/lib/utils"

import { api, clearToken } from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function AccountSwitcher({
  users,
}: {
  readonly users: ReadonlyArray<{
    readonly id: string
    readonly name: string
    readonly email: string
    readonly avatar: string
    readonly role: string
  }>
}) {
  const [activeUser, setActiveUser] = useState(users[0])
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      try {
        const profile = await api.get<any>("/api/profile/me/")
        setActiveUser({
          id: profile.user?.id || "1",
          name: profile.user?.first_name || profile.user?.email?.split("@")[0] || "Admin",
          email: profile.user?.email || "",
          avatar: profile.photos?.[0]?.image || "",
          role: profile.user?.role || "admin",
        })
      } catch (err) {
        console.error("Failed to load user profile:", err)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    clearToken()
    document.cookie = "selected_role=; path=/; max-age=0"
    router.push("/login")
  }

  if (!activeUser) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 rounded-lg">
          <AvatarImage
            src={activeUser.avatar || undefined}
            alt={activeUser.name}
          />
          <AvatarFallback>{getInitials(activeUser.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 space-y-1 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuItem
          className="p-0 bg-accent/50"
          aria-current="true"
        >
          <div className="flex w-full items-center gap-2 px-1 py-1.5">
            <Avatar className="size-9 rounded-lg">
              <AvatarImage src={activeUser.avatar || undefined} alt={activeUser.name} />
              <AvatarFallback>{getInitials(activeUser.name)}</AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeUser.name}</span>
              <span className="truncate text-xs capitalize">{activeUser.role}</span>
            </div>
            <span
              className="mr-1 flex size-5 items-center justify-center rounded-full text-primary opacity-100"
            >
              <Check aria-hidden="true" />
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/account" className="flex items-center cursor-pointer w-full">
              <BadgeCheck className="mr-2 h-4 w-4" />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
