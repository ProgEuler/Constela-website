"use client"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { getImageUrl, type VerificationUser } from "./verification-data"

type UserReviewCardProps = {
  user: VerificationUser
  selected: boolean
  onSelect: (user: VerificationUser) => void
}

function Thumb({ url, fallback, accent }: { url: string; fallback: string; accent?: boolean }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/50 text-xs font-semibold text-foreground",
        accent && "ring-2 ring-primary/50",
      )}
    >
      {url ? <img src={getImageUrl(url)} alt="" className="h-full w-full object-cover" /> : fallback}
    </div>
  )
}

export function UserReviewCard({ user, selected, onSelect }: UserReviewCardProps) {
  return (
    <Card
      onClick={() => onSelect(user)}
      className={cn(
        "cursor-pointer p-3 transition-all duration-150",
        selected ? "ring-2 ring-primary/50" : "hover:bg-muted/50",
      )}
    >
      <div className="flex items-center gap-3">
        {/* Profile picture next to the live photo: mismatches stand out at a glance. */}
        <div className="flex gap-1">
          <Thumb url={user.profilePhotoUrl} fallback={user.initials} />
          <Thumb url={user.selfieUrl} fallback="?" accent />
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          <div className="text-[11px] text-muted-foreground/70">Submitted {user.submittedDate}</div>
        </div>
      </div>
    </Card>
  )
}
