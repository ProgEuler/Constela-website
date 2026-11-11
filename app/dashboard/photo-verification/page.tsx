"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
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

const VERIFICATIONS_KEY = "/api/admin/verifications/"

const TABS: { value: VerificationStatus; label: string; empty: string }[] = [
  { value: "pending", label: "Pending", empty: "No photos waiting for review. 🎉" },
  { value: "verified", label: "Verified", empty: "No verified users yet." },
  { value: "rejected", label: "Rejected", empty: "No rejected verifications." },
]

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback
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
  const { data, error, isLoading, isValidating, mutate } = useSWR<VerificationData>(VERIFICATIONS_KEY)
  const [activeTab, setActiveTab] = useState<VerificationStatus>("pending")
  const [selectedId, setSelectedId] = useState<string | undefined>()

  const lists = useMemo<Record<VerificationStatus, VerificationUser[]>>(
    () => ({
      pending: (data?.pending ?? []).map(mapApiUser),
      verified: (data?.verified ?? []).map(mapApiUser),
      rejected: (data?.rejected ?? []).map(mapApiUser),
    }),
    [data],
  )

  useEffect(() => {
    if (error) toast.error(errorMessage(error, "Failed to load verifications."), { id: "verifications-load" })
  }, [error])

  const current = lists[activeTab]
  // The selected person, or the first in the list (e.g. after they were decided and left it).
  const selectedUser = useMemo(
    () => current.find((u) => u.id === selectedId) ?? current[0],
    [current, selectedId],
  )

  // After a decision, continue with the next person in the same list.
  const decideAndAdvance = async (user: VerificationUser, body: Record<string, string>, done: string) => {
    const index = current.findIndex((u) => u.id === user.id)
    const next = current[index + 1] ?? current[index - 1]
    try {
      await api.post(`/api/admin/verifications/${user.id}/action/`, body)
      toast.success(done)
      setSelectedId(next?.id)
      await mutate()
    } catch (err) {
      toast.error(errorMessage(err, "Something went wrong. Please try again."))
    }
  }

  const handleVerify = (user: VerificationUser) =>
    decideAndAdvance(user, { action: "approve" }, `${user.name} is now verified.`)

  const handleReject = (user: VerificationUser, reason: string) =>
    decideAndAdvance(user, { action: "reject", reason }, `${user.name}'s photo was rejected.`)

  return (
    <div className="space-y-6">
      <StatCard
        loading={isLoading}
        stats={[
          { label: "Pending", value: String(lists.pending.length), change: "", icon: Clock, iconColor: "warning" },
          { label: "Verified", value: String(lists.verified.length), change: "", icon: CircleCheck, iconColor: "success" },
          { label: "Rejected", value: String(lists.rejected.length), change: "", icon: OctagonX, iconColor: "destructive" },
        ]}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]" role="status" aria-label="Loading verifications">
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-20 w-full" />)}
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
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
            <Button variant="outline" size="sm" className="gap-2" onClick={() => mutate()} disabled={isValidating}>
              <RefreshCw className={isValidating ? "size-4 animate-spin" : "size-4"} />
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
                    {lists[tab.value].map((user) => (
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
                  {selectedUser ? (
                    // key: a fresh panel per person, so zoom/reject state never carries over.
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
      )}
    </div>
  )
}
