"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CircleCheck, Clock, Inbox, OctagonX, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatCard from "@/components/shared/stat-card"
import { api } from "@/lib/api"

import { UserReviewCard } from "./_components/user-review-card"
import { VerificationPanel } from "./_components/verification-panel"
import { type VerificationStatus, type VerificationUser } from "./_components/verification-data"

type ApiUser = {
  id: string
  name: string
  email: string
  joined_date: string
  status: VerificationStatus
  profile_photo_url?: string
  profile_photo_urls?: string[]
  selfie_url?: string
  selfie_urls?: string[]
  location?: string
  reason?: string
  submitted_date: string
}

type VerificationData = {
  pending: ApiUser[]
  verified: ApiUser[]
  rejected: ApiUser[]
}

const TABS: { value: VerificationStatus; label: string; empty: string }[] = [
  { value: "pending", label: "Pending", empty: "No photos waiting for review. 🎉" },
  { value: "verified", label: "Verified", empty: "No verified users yet." },
  { value: "rejected", label: "Rejected", empty: "No rejected verifications." },
]

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
}

function toLists(data: VerificationData): Record<VerificationStatus, VerificationUser[]> {
  return {
    pending: data.pending.map(mapApiUser),
    verified: data.verified.map(mapApiUser),
    rejected: data.rejected.map(mapApiUser),
  }
}

function mapApiUser(u: ApiUser): VerificationUser {
  const profilePhotoUrls = u.profile_photo_urls?.length
    ? u.profile_photo_urls
    : u.profile_photo_url
      ? [u.profile_photo_url]
      : []
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    joinedDate: u.joined_date,
    status: u.status,
    profilePhotoUrl: profilePhotoUrls[0] ?? "",
    profilePhotoUrls,
    // Older servers only send the 3-photo list; its first entry is the front photo.
    selfieUrl: u.selfie_url || u.selfie_urls?.find(Boolean) || "",
    initials: (u.name?.substring(0, 2) || "U").toUpperCase(),
    color: "",
    location: u.location,
    reason: u.reason || undefined,
    submittedDate: u.submitted_date,
  }
}

export default function PhotoVerificationPage() {
  const [lists, setLists] = useState<Record<VerificationStatus, VerificationUser[]>>({
    pending: [],
    verified: [],
    rejected: [],
  })
  const [activeTab, setActiveTab] = useState<VerificationStatus>("pending")
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) setIsLoading(true)
    try {
      setLists(toLists(await api.get<VerificationData>("/api/admin/verifications/")))
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load verifications."))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load (isLoading starts true). Later refreshes go through load().
  useEffect(() => {
    let cancelled = false
    api
      .get<VerificationData>("/api/admin/verifications/")
      .then((data) => {
        if (!cancelled) setLists(toLists(data))
      })
      .catch((err) => toast.error(errorMessage(err, "Failed to load verifications.")))
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const current = lists[activeTab]
  const selectedUser = useMemo(
    () => current.find((u) => u.id === selectedId) ?? current[0],
    [current, selectedId],
  )

  // After a decision, continue with the next person in the same list.
  const decideAndAdvance = async (user: VerificationUser, request: () => Promise<unknown>, done: string) => {
    const index = current.findIndex((u) => u.id === user.id)
    const next = current[index + 1] ?? current[index - 1]
    try {
      await request()
      toast.success(done)
      setSelectedId(next?.id)
      await load({ quiet: true })
    } catch (err) {
      toast.error(errorMessage(err, "Something went wrong. Please try again."))
    }
  }

  const handleVerify = (user: VerificationUser) =>
    decideAndAdvance(
      user,
      () => api.post(`/api/admin/verifications/${user.id}/action/`, { action: "approve" }),
      `${user.name} is now verified.`,
    )

  const handleReject = (user: VerificationUser, reason: string) =>
    decideAndAdvance(
      user,
      () => api.post(`/api/admin/verifications/${user.id}/action/`, { action: "reject", reason }),
      `${user.name}'s photo was rejected.`,
    )

  return (
    <div className="space-y-6">
      <StatCard
        stats={[
          { label: "Pending", value: String(lists.pending.length), change: "", icon: Clock, iconColor: "warning" },
          { label: "Verified", value: String(lists.verified.length), change: "", icon: CircleCheck, iconColor: "success" },
          { label: "Rejected", value: String(lists.rejected.length), change: "", icon: OctagonX, iconColor: "destructive" },
        ]}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as VerificationStatus)
          setSelectedId(undefined)
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                {tab.label}
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{lists[tab.value].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => load()} disabled={isLoading}>
            <RefreshCw className={isLoading ? "size-4 animate-spin" : "size-4"} />
            Refresh
          </Button>
        </div>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
              <div className="space-y-2">
                <span className="px-1 text-xs font-medium text-muted-foreground">
                  {tab.value === "pending"
                    ? `${lists.pending.length} to review · oldest first`
                    : `${lists[tab.value].length} ${tab.label.toLowerCase()}`}
                </span>
                <div className="flex max-h-[640px] flex-col gap-2 overflow-y-auto pr-1">
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[66px] w-full rounded-xl" />)
                    : lists[tab.value].map((user) => (
                        <UserReviewCard
                          key={user.id}
                          user={user}
                          selected={selectedUser?.id === user.id}
                          onSelect={(u) => setSelectedId(u.id)}
                        />
                      ))}
                </div>
              </div>

              <div className="min-w-0">
                {isLoading ? (
                  <Skeleton className="h-[520px] w-full rounded-xl" />
                ) : selectedUser ? (
                  <VerificationPanel
                    key={selectedUser.id}
                    user={selectedUser}
                    onVerify={handleVerify}
                    onReject={handleReject}
                  />
                ) : (
                  <div className="flex h-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border">
                    <Inbox className="size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{tab.empty}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
