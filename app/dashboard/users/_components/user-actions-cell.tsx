"use client"

import * as React from "react"
import type { ICellRendererParams } from "ag-grid-community"
import { Ban, EllipsisVertical, Gift, UserRound } from "lucide-react"

import { api } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { UserRow } from "./data"
import { GiftSubscriptionDialog } from "./gift-dialog"
import { UserProfileDialog } from "./user-profile-dialog"

type UserActionsCellProps = ICellRendererParams<UserRow>

export function UserActionsCell({ data, context }: UserActionsCellProps) {
  const [viewOpen, setViewOpen] = React.useState(false)
  const [giftOpen, setGiftOpen] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const handleBlock = async () => {
    if (!data) return;
    const isCurrentlyBlocked = data.status === "Blocked";
    const actionText = isCurrentlyBlocked ? "unblock" : "block";
    try {
      setIsProcessing(true)
      await api.post(`/api/admin/users/${data.id}/block/`)
      toast.success(`User successfully ${actionText}ed.`)
      setBlockDialogOpen(false)
      if (context && context.reloadUsers) {
        context.reloadUsers()
      }
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${actionText} user.`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!data) return;
    try {
      setIsProcessing(true)
      await api.delete(`/api/admin/users/${data.id}/`)
      toast.success("User and all associated data completely deleted.")
      setDeleteDialogOpen(false)
      if (context && context.reloadUsers) {
        context.reloadUsers()
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!data) return null

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      data-cell-click-ignore
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Open actions for ${data.name}`}
            className="size-8 rounded-md text-muted-foreground hover:bg-muted/50"
            size="icon-sm"
            variant="ghost"
          >
            <EllipsisVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setViewOpen(true)}>
            <UserRound className="size-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setGiftOpen(true)}>
            <Gift className="size-4" />
            Gift
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isProcessing}
            onSelect={(event) => {
              event.preventDefault()
              setBlockDialogOpen(true)
            }}
          >
            <Ban className="size-4" />
            {data.status === "Blocked" ? "Unblock User" : "Block User"}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={isProcessing}
            onSelect={(event) => {
              event.preventDefault()
              setDeleteDialogOpen(true)
            }}
          >
            <Ban className="size-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfileDialog user={data} open={viewOpen} onOpenChange={setViewOpen} />
      <GiftSubscriptionDialog user={data} open={giftOpen} onOpenChange={setGiftOpen} />

      {/* Block Confirmation Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {data.status === "Blocked" ? "Unblock User Account" : "Block User Account"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {data.status === "Blocked" ? "unblock" : "block"}{" "}
              <span className="font-semibold text-foreground">{data.name}</span>?{" "}
              {data.status !== "Blocked" &&
                "Blocking this user will instantly revoke their access and they won't be able to log in with this email address."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBlockDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleBlock} disabled={isProcessing}>
              {isProcessing
                ? "Processing..."
                : data.status === "Blocked"
                ? "Unblock User"
                : "Block User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">{data.name}</span>?{" "}
              <span className="font-semibold text-destructive">This action is irreversible</span>{" "}
              and will completely wipe all of their profile data, history, and records from the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
