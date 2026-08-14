"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"

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
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [roomDetailsMap, setRoomDetailsMap] = useState<Record<string, ChatRoomDetail>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Load Rooms List
  const loadRooms = useCallback(async () => {
    try {
      const data = await api.get<any>("/api/admin/chat/rooms/")
      const loadedRooms: ChatRoom[] = data.rooms.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        description: r.description,
        type: "public",
        memberCount: r.member_count,
        messageCount: r.messages_count,
        createdAt: r.created_at,
      }))
      setRooms(loadedRooms)
      if (loadedRooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(loadedRooms[0].id)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load chat rooms.")
    }
  }, [selectedRoomId])

  useEffect(() => { loadRooms() }, [loadRooms])

  // Load Room Details
  const loadRoomDetails = useCallback(async (roomId: string) => {
    try {
      const data = await api.get<any>(`/api/admin/chat/rooms/${roomId}/`)
      const detail: ChatRoomDetail = {
        id: String(data.id),
        name: data.name,
        description: data.description,
        type: "public",
        memberCount: data.members?.length ?? 0,
        messageCount: data.messages_count ?? 0,
        createdAt: data.created_at,
        members: (data.members || []).map((m: any) => ({
          id: String(m.id),
          name: m.name || m.username || "Unknown",
          email: m.email || "No email",
          initials: ((m.name || m.username || "U").substring(0, 2)).toUpperCase(),
          avatarBg: getColor(String(m.id)),
          avatar: m.photo,
          role: "member",
          joinedAt: m.joined_at || data.created_at,
        })) as ChatMember[],
      }
      setRoomDetailsMap((prev) => ({ ...prev, [roomId]: detail }))
    } catch (err: any) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    if (selectedRoomId) {
      loadRoomDetails(selectedRoomId)
    }
  }, [selectedRoomId, loadRoomDetails])

  const selectedRoom = selectedRoomId ? roomDetailsMap[selectedRoomId] ?? null : null

  const handleRename = async (id: string, name: string, description: string) => {
    try {
      await api.put(`/api/admin/chat/rooms/${id}/`, { name, description })
      toast.success("Room updated successfully")
      loadRooms()
      loadRoomDetails(id)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update room.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/admin/chat/rooms/${id}/`)
      toast.success("Room deleted successfully")
      
      setRooms((prev) => {
        const next = prev.filter((r) => r.id !== id)
        if (selectedRoomId === id) {
          setSelectedRoomId(next[0]?.id ?? null)
        }
        return next
      })
      setRoomDetailsMap((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete room.")
    }
  }

  const handleCreate = async (name: string, description: string) => {
    try {
      await api.post(`/api/admin/chat/rooms/`, { name, description })
      toast.success("Room created successfully")
      loadRooms()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create room.")
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-0 overflow-hidden rounded-2xl border bg-card">
      {/* Left Panel */}
      <div className="flex w-full max-w-sm shrink-0 flex-col border-r p-4">
        <RoomListPanel
          rooms={rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
          onOpenCreate={() => setCreateDialogOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col overflow-y-auto p-5">
        <RoomDetailPanel
          room={selectedRoom}
          onRename={() => setRenameDialogOpen(true)}
          onDelete={() => setDeleteDialogOpen(true)}
        />
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