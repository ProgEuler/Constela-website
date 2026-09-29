"use client"

import { useEffect, useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

import {
  type ChatRoom,
  type ChatRoomDetail,
  type ChatMember,
} from "./_components/chat-rooms-data"
import CreateRoomDialog from "./_components/create-room-dialog"
import DeleteRoomDialog from "./_components/delete-room-dialog"
import RenameRoomDialog from "./_components/rename-room-dialog"
import RoomDetailPanel from "./_components/room-detail-panel"
import RoomListPanel from "./_components/room-list-panel"

const colors = [
  "from-violet-500 to-fuchsia-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-rose-500",
  "from-pink-500 to-purple-500",
  "from-sky-500 to-indigo-500",
  "from-amber-500 to-red-500",
  "from-green-500 to-emerald-500",
]
function getColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function ChatDashboard() {
  const { mutate } = useSWRConfig()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: roomsData, error: roomsError, isLoading: roomsLoading, mutate: mutateRooms } = useSWR<any>("/api/admin/chat/rooms/")
  const rooms: ChatRoom[] = (roomsData?.rooms ?? []).map((r: any) => ({
        id: String(r.id),
        name: r.name,
        description: r.description,
        type: "public",
        memberCount: r.member_count,
        messageCount: r.messages_count,
        createdAt: r.created_at,
      }))

  useEffect(() => {
    if (roomsError) toast.error(roomsError.message ?? "Failed to load chat rooms.", { id: "rooms-load" })
  }, [roomsError])

  useEffect(() => {
    if (!selectedRoomId && rooms.length > 0) setSelectedRoomId(rooms[0].id)
  }, [rooms, selectedRoomId])

  const detailKey = selectedRoomId ? `/api/admin/chat/rooms/${selectedRoomId}/` : null
  const { data: detailData, isLoading: detailLoading, mutate: mutateDetail } = useSWR<any>(detailKey)
  const selectedRoom: ChatRoomDetail | null = detailData ? {
        id: String(detailData.id),
        name: detailData.name,
        description: detailData.description,
        type: "public",
        memberCount: detailData.members?.length ?? 0,
        messageCount: detailData.messages_count ?? 0,
        createdAt: detailData.created_at,
        members: (detailData.members || []).map((m: any) => ({
          id: String(m.id),
          name: m.name || m.username || "Unknown",
          email: m.email || "No email",
          initials: ((m.name || m.username || "U").substring(0, 2)).toUpperCase(),
          avatarBg: getColor(String(m.id)),
          avatar: m.photo,
          role: "member",
          joinedAt: m.joined_at || detailData.created_at,
        })) as ChatMember[],
      } : null

  const handleRename = async (id: string, name: string, description: string) => {
    try {
      await api.put(`/api/admin/chat/rooms/${id}/`, { name, description })
      toast.success("Room updated successfully")
      mutateRooms()
      mutateDetail()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update room.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/admin/chat/rooms/${id}/`)
      toast.success("Room deleted successfully")
      
      mutateRooms((current: any) => {
        const next = (current?.rooms ?? []).filter((r: any) => String(r.id) !== id)
        if (selectedRoomId === id) {
          setSelectedRoomId(next[0] ? String(next[0].id) : null)
        }
        return { ...current, rooms: next }
      }, { revalidate: false })
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete room.")
    }
  }

  const handleCreate = async (name: string, description: string) => {
    try {
      const created = await api.post<{ id: string | number }>(`/api/admin/chat/rooms/`, { name, description })
      const roomId = String(created.id)
      const roomKey = `/api/admin/chat/rooms/${roomId}/`
      const [, roomDetail] = await Promise.all([
        mutateRooms(),
        api.get(roomKey),
      ])
      await mutate(roomKey, roomDetail, { revalidate: false })
      setSelectedRoomId(roomId)
      toast.success("Room created successfully")
      return true
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create room.")
      return false
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-0 overflow-hidden rounded-2xl border bg-card">
      {/* Left Panel */}
      <div className="flex w-full max-w-sm shrink-0 flex-col border-r p-4">
        {roomsLoading ? (
          <div className="space-y-4" role="status" aria-label="Loading chat rooms">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-16 w-full" />)}
          </div>
        ) : <RoomListPanel
          rooms={rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
          onOpenCreate={() => setCreateDialogOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />}
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col overflow-y-auto p-5">
        {detailLoading ? (
          <div className="space-y-5" role="status" aria-label="Loading room details">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80 max-w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : <RoomDetailPanel
          room={selectedRoom}
          onRename={() => setRenameDialogOpen(true)}
          onDelete={() => setDeleteDialogOpen(true)}
        />}
      </div>

      {/* Create Room Dialog */}
      <CreateRoomDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreate}
      />

      {/* Rename Room Dialog */}
      {selectedRoom && (
        <RenameRoomDialog
          key={selectedRoom.id}
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          initialName={selectedRoom.name}
          initialDescription={selectedRoom.description}
          onSave={(name, description) => handleRename(selectedRoom.id, name, description)}
        />
      )}

      {/* Delete Room Dialog */}
      {selectedRoom && (
        <DeleteRoomDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          roomName={selectedRoom.name}
          onConfirm={() => handleDelete(selectedRoom.id)}
        />
      )}
    </div>
  )
}
