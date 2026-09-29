"use client"

import { CheckCircle2, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

export function VerificationPanel({
  user,
  onVerify,
  onReject,
}: VerificationPanelProps) {
  const meta = statusMeta[user.status]
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className={cn("grid gap-4", user.profilePhotoUrl ? "grid-cols-2" : "grid-cols-1")}>
          {/* Profile Photo */}
          {user.profilePhotoUrl && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">
                  Profile Photo
                </span>
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                <img
                  src={getImageUrl(user.profilePhotoUrl)}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Verification Selfies */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">
                Verification Selfies
              </span>
            </div>
            <div className="flex gap-2 h-[200px]">
              {user.selfieUrls && user.selfieUrls.length > 0 ? (
                user.selfieUrls.map((url, i) => (
                  url ? (
                    <div 
                      key={i} 
                      className="relative flex-1 cursor-pointer overflow-hidden rounded-xl bg-muted transition-transform hover:scale-[1.02]"
                      onClick={() => setSelectedImage(getImageUrl(url))}
                    >
                      <img
                        src={getImageUrl(url)}
                        alt={`Selfie ${i}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null
                ))
              ) : (
                <div className="flex w-full h-full rounded-xl bg-muted items-center justify-center text-muted-foreground text-sm">
                  No selfies
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent shadow-none">
          {selectedImage && (
            <img src={selectedImage} alt="Enlarged verification" className="w-full h-auto object-contain rounded-xl max-h-[80vh]" />
          )}
        </DialogContent>
      </Dialog>

      <Separator />

      {/* User details */}
      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <span className="text-xs text-muted-foreground">Joined</span>
            <p className="text-sm text-foreground">{user.joinedDate}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Submitted</span>
            <p className="text-sm text-foreground">{user.submittedDate}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">User ID</span>
            <p className="font-mono text-sm text-foreground">{user.id}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Status</span>
            <p className="text-sm text-foreground">{meta.label}</p>
          </div>
        </div>

        {user.reason && (
          <div className="mt-3 rounded-lg bg-destructive/5 p-3">
            <span className="text-xs font-medium text-destructive">
              Rejection reason
            </span>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {user.reason}
            </p>
          </div>
        )}
      </CardContent>

      <Separator />

      {/* Action buttons */}
      <CardContent className="p-5">
        <div className="flex gap-3">
          {(user.status === "pending" || user.status === "verified") && (
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => onReject(user)}
            >
              <XCircle className="size-4 text-destructive" />
              Reject
            </Button>
          )}
          {(user.status === "pending" || user.status === "rejected") && (
            <Button className="flex-1 gap-2" onClick={() => onVerify(user)}>
              <CheckCircle2 className="size-4" />
              Verify Identity
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
