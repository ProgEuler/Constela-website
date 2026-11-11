"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, ImageOff, Info, MapPin, XCircle, ZoomIn } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { API_BASE } from "@/lib/api"

import { statusMeta, type VerificationUser } from "./verification-data"
import { Avatar } from "@/components/ui/avatar"
import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

type VerificationPanelProps = {
  user: VerificationUser
  onVerify: (user: VerificationUser) => void
  onReject: (user: VerificationUser) => void
}

const getImageUrl = (path: string | undefined | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

export function VerificationPanel({ user, onVerify, onReject }: VerificationPanelProps) {
  const meta = statusMeta[user.status]
  const profilePhotos = (user.profilePhotoUrls.length ? user.profilePhotoUrls : [user.profilePhotoUrl])
    .filter(Boolean)
    .map(getImageUrl)
  const selfie = getImageUrl(user.selfieUrl)

  const [photoIndex, setPhotoIndex] = useState(0)
  const [enlarged, setEnlarged] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)

  // The page remounts this panel per user (key={user.id}), so the viewer state starts fresh.

  const canApprove = user.status !== "verified"
  const canReject = user.status !== "rejected"

  const approve = async () => {
    if (!canApprove || busy) return
    setBusy(true)
    try {
      await onVerify(user)
    } finally {
      setBusy(false)
    }
  }

  const confirmReject = async () => {
    if (busy) return
    setBusy(true)
    try {
      await onReject(user, reason.trim())
      setRejectOpen(false)
    } finally {
      setBusy(false)
    }
  }

  // Keyboard shortcuts: A = approve, R = reject, ←/→ = flip profile pictures.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (rejectOpen || enlarged || e.metaKey || e.ctrlKey || e.altKey) return
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return
      const key = e.key.toLowerCase()
      if (key === "a" && canApprove) {
        e.preventDefault()
        void approve()
      } else if (key === "r" && canReject) {
        e.preventDefault()
        setRejectOpen(true)
      } else if (e.key === "ArrowRight" && profilePhotos.length > 1) {
        setPhotoIndex((i) => (i + 1) % profilePhotos.length)
      } else if (e.key === "ArrowLeft" && profilePhotos.length > 1) {
        setPhotoIndex((i) => (i - 1 + profilePhotos.length) % profilePhotos.length)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <Card className="overflow-hidden">
      {/* Who */}
      <CardContent className="flex flex-wrap items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-foreground">{user.name}</h2>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          {user.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" /> {user.location}
            </p>
          )}
        </div>
        <Badge variant="outline" className={cn("gap-1.5", meta.bgClass)}>
          <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
          {meta.label}
        </Badge>
      </CardContent>

      <Separator />

      {/* Side-by-side comparison */}
      <CardContent className="p-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <PhotoBox
              url={profilePhotos[photoIndex] ?? ""}
              label={
                profilePhotos.length > 1
                  ? `Profile picture ${photoIndex + 1} of ${profilePhotos.length}`
                  : "Profile picture"
              }
              onOpen={setEnlarged}
            />
            {profilePhotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {profilePhotos.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    onClick={() => setPhotoIndex(i)}
                    className={cn(
                      "size-12 shrink-0 overflow-hidden rounded-lg border-2 transition",
                      i === photoIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <img src={url} alt={`Profile ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <PhotoBox url={selfie} label="Live verification photo" accent onOpen={setEnlarged} />
        </div>

        <div className="mt-4 flex gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Compare face shape, eyes, nose, eyebrows and hairline. Approve only if it is clearly the same
            person. Lighting and angle can differ.
          </span>
        </div>
      </CardContent>

      <Separator />

      {/* Details */}
      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <span className="text-xs text-muted-foreground">Joined</span>
            <p className="text-sm text-foreground">{user.joinedDate}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Photo submitted</span>
            <p className="text-sm text-foreground">{user.submittedDate}</p>
          </div>
        </div>

        {user.status === "rejected" && user.reason && (
          <div className="mt-3 rounded-lg bg-destructive/5 p-3">
            <span className="text-xs font-medium text-destructive">Reason sent to the user</span>
            <p className="mt-0.5 text-sm text-muted-foreground">{user.reason}</p>
          </div>
        )}
      </CardContent>

      <Separator />

      {/* Decision */}
      <CardContent className="p-5">
        <div className="flex gap-3">
          {canReject && (
            <Button
              variant="outline"
              className="flex-1 gap-2"
              disabled={busy}
              onClick={() => setRejectOpen(true)}
            >
              <XCircle className="size-4 text-destructive" />
              {user.status === "verified" ? "Revoke verification" : "Reject"}
              <Kbd className="ml-1 hidden sm:inline-flex">R</Kbd>
            </Button>
          )}
          {canApprove && (
            <Button className="flex-1 gap-2" disabled={busy} onClick={approve}>
              <CheckCircle2 className="size-4" />
              {user.status === "rejected" ? "Approve after all" : "Approve — same person"}
              <Kbd className="ml-1 hidden bg-primary-foreground/20 text-primary-foreground sm:inline-flex">A</Kbd>
            </Button>
          )}
        </div>
      </CardContent>

      {/* Enlarged image */}
      <Dialog open={!!enlarged} onOpenChange={(open) => !open && setEnlarged(null)}>
        <DialogContent className="max-w-3xl overflow-hidden border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Enlarged photo</DialogTitle>
          {enlarged && (
            <img src={enlarged} alt="Enlarged" className="h-auto max-h-[85vh] w-full rounded-xl object-contain" />
          )}
        </DialogContent>
      </Dialog>

      {/* Reject with reason */}
      <Dialog open={rejectOpen} onOpenChange={(open) => !busy && setRejectOpen(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {user.status === "verified" ? "Revoke" : "Reject"} verification for {user.name}?
            </DialogTitle>
            <DialogDescription>
              The reason is shown to the user in the app, and they can take a new photo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {QUICK_REJECT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition",
                  reason === r ? "border-primary bg-primary/5 text-foreground" : "border-border hover:bg-muted/60",
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 255))}
            placeholder="Or write your own reason (optional)"
            rows={3}
          />
          <p className="-mt-2 text-right text-[11px] text-muted-foreground">{reason.length}/255</p>

          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={busy} onClick={confirmReject}>
              {user.status === "verified" ? "Revoke verification" : "Reject photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
