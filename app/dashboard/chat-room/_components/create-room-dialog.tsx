"use client"

import { useState } from "react"
import { Lock, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate?: (name: string, description: string) => void
}

export default function CreateRoomDialog({
  open,
  onOpenChange,
  onCreate
}: CreateRoomDialogProps) {
  const [roomName, setRoomName] = useState("")
  const [description, setDescription] = useState("")
  const [roomType, setRoomType] = useState<"public" | "private">("public")

  const handleCreate = () => {
    if (!roomName.trim()) return
    onCreate?.(roomName, description)
    onOpenChange(false)
    setRoomName("")
    setDescription("")
    setRoomType("public")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Chat Room</DialogTitle>
          <DialogDescription>
            Create a new room for your community to connect and chat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="Enter room name..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!roomName.trim()}>
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
