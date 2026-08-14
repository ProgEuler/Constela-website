"use client"

import { Ban, Calendar, MessageSquare, MoreVertical, Pencil, Shield, Trash2, UserMinus, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type { ChatRoomDetail } from "./chat-rooms-data"

interface RoomDetailPanelProps {
  room: ChatRoomDetail | null
  onRename: () => void
  onDelete: () => void
}

export default function RoomDetailPanel({
  room,
  onRename,
  onDelete,
}: RoomDetailPanelProps) {
  if (!room) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Select a room to view details
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Choose a room from the left panel
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Room Details */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-bold">{room.name}</h2>
              <Badge
                variant={room.type === "public" ? "secondary" : "outline"}
                className="shrink-0"
              >
                {room.type === "public" ? "Public" : "Private"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {room.description}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Room actions"
                aria-label="Room actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2.5" onSelect={onRename}>
                <Pencil className="h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="gap-2.5"
                onSelect={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {room.memberCount} members
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            {room.messageCount} messages
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Created {room.createdAt}
          </span>
        </div>
      </div>

      <Separator />

      {/* Members */}
      <div className="flex-1">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Members ({room.members.length})</h3>
        </div>

        <div className="space-y-1">
          {room.members.map((member) => (
            <div
              key={member.id}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <Avatar size="sm">
                {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                <AvatarFallback className={cn("text-[10px] text-white", member.avatarBg)}>
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">
                    {member.name}
                  </span>
                  {member.role !== "member" && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "shrink-0 px-1.5 text-[10px]",
                        member.role === "admin" && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                        member.role === "moderator" && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                      )}
                    >
                      {member.role === "admin" ? (
                        <Shield className="mr-0.5 h-2.5 w-2.5" />
                      ) : null}
                      {member.role}
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="gap-2.5">
                    <Ban className="h-4 w-4" />
                    Block User
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" className="gap-2.5">
                    <UserMinus className="h-4 w-4" />
                    Remove from Room
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
