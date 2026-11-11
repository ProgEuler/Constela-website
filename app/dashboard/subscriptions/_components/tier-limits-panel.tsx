"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Shield, Sparkles, Crown, Heart, MessageSquare, Users, RotateCcw, Eye, Save, Loader2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"

export type TierConfig = {
  tier: "freemium" | "light" | "plus"
  name: string
  daily_likes_limit: number | null
  daily_personal_messages_limit: number | null
  daily_community_messages_limit: number | null
  community_room_limit: number | null
  can_see_likes: boolean
  can_undo_swipes: boolean
  updated_at?: string | null
}

type TiersResponse = {
  tiers: TierConfig[]
}

const TIER_ICONS = {
  freemium: Shield,
  light: Sparkles,
  plus: Crown,
}

export function TierLimitsPanel() {
  const { data, error, isLoading, mutate } = useSWR<TiersResponse>("/api/admin/subscriptions/tiers/")
  const [formData, setFormData] = useState<Record<string, TierConfig> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const serverFormData = useMemo(() => {
    const map: Record<string, TierConfig> = {}
    for (const tier of data?.tiers ?? []) {
      map[tier.tier] = { ...tier }
    }
    return map
  }, [data])
  const currentFormData = formData ?? serverFormData

  useEffect(() => {
    if (error) {
      toast.error(error.message ?? "Could not load tier configurations.")
    }
  }, [error])

  const handleNumericChange = (
    tier: string,
    field: "daily_likes_limit" | "daily_personal_messages_limit" | "daily_community_messages_limit" | "community_room_limit",
    value: string
  ) => {
    setFormData((prev) => {
      const base = prev ?? serverFormData
      const current = base[tier]
      if (!current) return base
      const parsed = value.trim() === "" ? null : Math.max(0, parseInt(value, 10) || 0)
      return {
        ...base,
        [tier]: {
          ...current,
          [field]: parsed,
        },
      }
    })
  }

  const handleBooleanChange = (
    tier: string,
    field: "can_see_likes" | "can_undo_swipes",
    checked: boolean
  ) => {
    setFormData((prev) => {
      const base = prev ?? serverFormData
      const current = base[tier]
      if (!current) return base
      return {
        ...base,
        [tier]: {
          ...current,
          [field]: checked,
        },
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = Object.values(currentFormData)
      await api.put("/api/admin/subscriptions/tiers/", { tiers: payload })
      toast.success("Tier limits updated successfully! Live changes are now active.")
      await mutate()
      setFormData(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update tier configurations.")
    } finally {
      setIsSaving(false)
    }
  }

  const tierKeys: ("freemium" | "light" | "plus")[] = ["freemium", "light", "plus"]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Subscription Tier Quotas & Rules</h2>
          <p className="text-sm text-muted-foreground">
            Configure dynamic limits across all tiers. Updates take effect immediately and sync live to open user devices.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="self-start sm:self-auto gap-2"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tierKeys.map((key) => {
          const config = currentFormData[key]
          const Icon = TIER_ICONS[key]

          if (!config && isLoading) {
            return (
              <Card key={key} className="p-6 space-y-4">
                <div className="h-6 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </Card>
            )
          }

          return (
            <Card key={key} className="flex flex-col justify-between">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <CardTitle className="text-base font-bold">
                    {config?.name || key.toUpperCase()}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {key === "freemium" && "Default access for all registered free users"}
                  {key === "light" && "Affordable starter tier for active searchers"}
                  {key === "plus" && "Top-tier unrestricted experience"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                {/* Daily Likes Limit */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      Daily Likes Limit
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {config?.daily_likes_limit === null ? "Unlimited" : `${config?.daily_likes_limit ?? 0} / day`}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Leave blank for unlimited"
                    value={config?.daily_likes_limit ?? ""}
                    onChange={(e) => handleNumericChange(key, "daily_likes_limit", e.target.value)}
                    className="h-9 text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Reset daily at midnight. Empty = unlimited.
                  </p>
                </div>

                {/* Daily Personal Messages Limit */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      Daily Personal Messages
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {config?.daily_personal_messages_limit === null ? "Unlimited" : `${config?.daily_personal_messages_limit ?? 0} / day`}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Leave blank for unlimited"
                    value={config?.daily_personal_messages_limit ?? ""}
                    onChange={(e) => handleNumericChange(key, "daily_personal_messages_limit", e.target.value)}
                    className="h-9 text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Personal messages sent per day. Empty = unlimited.
                  </p>
                </div>

                {/* Daily Community Messages Limit */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                      Daily Community Messages
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {config?.daily_community_messages_limit === null ? "Unlimited" : `${config?.daily_community_messages_limit ?? 0} / day`}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Leave blank for unlimited"
                    value={config?.daily_community_messages_limit ?? ""}
                    onChange={(e) => handleNumericChange(key, "daily_community_messages_limit", e.target.value)}
                    className="h-9 text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Community-room messages sent per day. Empty = unlimited.
                  </p>
                </div>

                {/* Community Chat Rooms Limit */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-emerald-500" />
                      Community Rooms
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {config?.community_room_limit === null
                        ? "All Rooms"
                        : config?.community_room_limit === 0
                        ? "0 (Locked)"
                        : `${config?.community_room_limit} rooms`}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0 = None, Empty = All"
                    value={config?.community_room_limit ?? ""}
                    onChange={(e) => handleNumericChange(key, "community_room_limit", e.target.value)}
                    className="h-9 text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    0 = locked, empty = all community rooms.
                  </p>
                </div>

                {/* Permissions Toggles */}
                <div className="pt-2 border-t space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                    <Checkbox
                      checked={Boolean(config?.can_see_likes)}
                      onCheckedChange={(checked) => handleBooleanChange(key, "can_see_likes", Boolean(checked))}
                    />
                    <Eye className="h-3.5 w-3.5 text-amber-500" />
                    <span>See Who Liked You</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                    <Checkbox
                      checked={Boolean(config?.can_undo_swipes)}
                      onCheckedChange={(checked) => handleBooleanChange(key, "can_undo_swipes", Boolean(checked))}
                    />
                    <RotateCcw className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Rewind Swipes (Undo)</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
