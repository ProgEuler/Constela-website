"use client"

import * as React from "react"
import { Check, Gift } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn, getInitials } from "@/lib/utils"

import { type UserRow } from "./data"

type Plan = {
  value: string
  name: string
  price: string
  period: string
  features: string[]
  accent: "emerald" | "orange" | "violet"
}

const PLANS: Plan[] = [
  {
    value: "premium-light",
    name: "Premium Light",
    price: "€9.99",
    period: "month",
    features: ["Unlimited matches", "Advanced filters", "See who liked you", "Priority support"],
    accent: "emerald",
  },
  {
    value: "premium-annual",
    name: "Premium Annual",
    price: "€99.99",
    period: "year",
    features: [
      "Everything in Plus",
      "2 months free",
      "Exclusive events access",
      "Dedicated support line",
    ],
    accent: "orange",
  },
  {
    value: "premium-plus",
    name: "Premium Plus",
    price: "€14.99",
    period: "month",
    features: [
      "Everything in Light",
      "Boost profile 2×/week",
      "Read receipts",
      "Incognito mode",
      "Verified badge",
    ],
    accent: "violet",
  },
]

const DURATIONS = [
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
]

const ACCENT_STYLES: Record<Plan["accent"], { border: string; text: string; bg: string; ring: string }> = {
  emerald: {
    border: "border-emerald-500/60",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/5",
    ring: "ring-emerald-500/40",
  },
  orange: {
    border: "border-orange-500/60",
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/5",
    ring: "ring-orange-500/40",
  },
  violet: {
    border: "border-violet-500/60",
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/5",
    ring: "ring-violet-500/40",
  },
}

type GiftSubscriptionDialogProps = {
  user: UserRow
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onGifted?: () => void
}

// Map plan value → backend tier slug
const PLAN_TIER_MAP: Record<string, string> = {
  "premium-light": "light",
  "premium-plus": "plus",
  "premium-annual": "annual",
}

export function GiftSubscriptionDialog({ user, open, onOpenChange, onGifted }: GiftSubscriptionDialogProps) {
  const [plan, setPlan] = React.useState<string>("premium-plus")
  const [duration, setDuration] = React.useState<string>("3")
  const [isLoading, setIsLoading] = React.useState(false)

  const selectedPlan = PLANS.find((p) => p.value === plan) ?? PLANS[0]
  const selectedDuration = DURATIONS.find((d) => d.value === duration) ?? DURATIONS[0]
  const currentPlanLabel = user.subscription ?? "Free"

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const { api } = await import("@/lib/api")
      await api.post(`/api/admin/users/${user.id}/gift/`, {
        tier: PLAN_TIER_MAP[plan] ?? "plus",
        duration_months: parseInt(duration),
      })
      const { toast } = await import("sonner")
      toast.success(`Gifted ${selectedPlan.name} (${selectedDuration.label}) to ${user.name}.`)
      onGifted?.()
      onOpenChange?.(false)
    } catch (err: any) {
      const { toast } = await import("sonner")
      toast.error(err?.message ?? "Failed to gift subscription.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
              <Gift className="size-4" />
            </span>
            Gift Subscription
          </DialogTitle>
          <DialogDescription>to {user.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 pb-5">
          {/* Recipient card */}
          <div className="flex items-center gap-3 rounded-xl border p-3">
            <Avatar
              size="default"
              className="bg-emerald-700 text-white [&_[data-slot=avatar-fallback]]:bg-emerald-700 [&_[data-slot=avatar-fallback]]:text-white"
            >
              <AvatarFallback className="text-sm font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-muted-foreground text-xs">{user.email}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-muted-foreground text-[11px]">Current plan</span>
              <Badge
                className="border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-amber-400"
                variant="outline"
              >
                {currentPlanLabel}
              </Badge>
            </div>
          </div>

          {/* Plans */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-medium">Select a subscription plan to gift</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {PLANS.map((p) => {
                const accent = ACCENT_STYLES[p.accent]
                const active = plan === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPlan(p.value)}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors",
                      active
                        ? cn(accent.border, accent.bg, "ring-1 ring-inset", accent.ring)
                        : "border-border hover:bg-muted/30",
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className={cn("text-sm font-semibold", active && accent.text)}>
                        {p.name}
                      </span>
                      {active ? (
                        <span
                          className={cn(
                            "flex size-4 items-center justify-center rounded-full",
                            accent.bg,
                          )}
                        >
                          <Check className={cn("size-3", accent.text)} />
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-foreground text-lg font-bold">{p.price}</span>
                      <span className="text-muted-foreground text-xs">/ {p.period}</span>
                    </div>
                    <ul className="text-muted-foreground w-full space-y-1 text-xs">
                      {p.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-1.5">
                          <Check
                            className={cn(
                              "size-3 shrink-0",
                              active ? accent.text : "text-emerald-500",
                            )}
                          />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-medium">Gift duration</h3>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => {
                const active = duration === d.value
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-orange-500/60 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        : "border-border hover:bg-muted/30",
                    )}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Summary banner */}
          <div className="flex items-center gap-3 rounded-xl bg-orange-500/10 px-3 py-2.5 text-sm">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400">
              <Gift className="size-3.5" />
            </span>
            <span className="text-foreground">
              You&apos;re gifting <span className="font-semibold">{selectedPlan.name}</span> for{" "}
              <span className="font-semibold">{selectedDuration.label}</span> to{" "}
              <span className="font-semibold">{user.name}</span>
            </span>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 border-t px-5 py-4 sm:justify-start">
          <Button
            className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            <Gift />
            {isLoading ? "Gifting…" : "Confirm Gift"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
