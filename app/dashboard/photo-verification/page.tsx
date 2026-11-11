"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { CircleCheck, Clock, OctagonX } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatCard from "@/components/shared/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [selectedUser, setSelectedUser] = useState<VerificationUser | undefined>()
  const [activeTab, setActiveTab] = useState<string>("pending")
  const { data, error, isLoading, mutate } = useSWR<VerificationData>("/api/admin/verifications/")
  const pendingUsers = useMemo(() => (data?.pending ?? []).map(mapApiUser), [data])
  const verifiedUsers = useMemo(() => (data?.verified ?? []).map(mapApiUser), [data])
  const rejectedUsers = useMemo(() => (data?.rejected ?? []).map(mapApiUser), [data])

  useEffect(() => {
    if (error) toast.error(error.message ?? "Failed to load verifications.", { id: "verifications-load" })
  }, [error])

  useEffect(() => {
    const currentList = activeTab === "pending" ? pendingUsers : activeTab === "verified" ? verifiedUsers : rejectedUsers
    if (!selectedUser || !currentList.some((user) => user.id === selectedUser.id)) {
      setSelectedUser(currentList[0])
    }
  }, [activeTab, data, selectedUser, pendingUsers, verifiedUsers, rejectedUsers])

  const handleVerify = async (user: VerificationUser) => {
    try {
      await api.post(`/api/admin/verifications/${user.id}/action/`, { action: "approve" })
      toast.success(`${user.name} has been verified.`)
      mutate()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to verify user.")
    }
  }

  const handleReject = async (user: VerificationUser) => {
    try {
      await api.post(`/api/admin/verifications/${user.id}/action/`, { action: "reject" })
      toast.success(`${user.name} has been rejected.`)
      mutate()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reject user.")
    }
  }

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
      ) : <Tabs
        defaultValue="pending"
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
              {selectedUser?.status === "pending" ? (
                <VerificationPanel
                  user={selectedUser}
                  onVerify={handleVerify}
                  onReject={handleReject}
                />
              ) : (
                <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    Select a pending user to review
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="verified">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {verifiedUsers.length} verified users
                </span>
              </div>
              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
                {verifiedUsers.map((user) => (
                  <UserReviewCard
                    key={user.id}
                    user={user}
                    selected={selectedUser?.id === user.id}
                    onSelect={setSelectedUser}
                  />
                ))}
              </div>
            </div>

            <div className="min-w-0">
              {selectedUser?.status === "verified" ? (
                <VerificationPanel
                  user={selectedUser}
                  onVerify={handleVerify}
                  onReject={handleReject}
                />
              ) : (
                <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    Select a verified user to view
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {rejectedUsers.length} rejected users
                </span>
              </div>
              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
                {rejectedUsers.map((user) => (
                  <UserReviewCard
                    key={user.id}
                    user={user}
                    selected={selectedUser?.id === user.id}
                    onSelect={setSelectedUser}
                  />
                ))}
              </div>
            </div>

            <div className="min-w-0">
              {selectedUser?.status === "rejected" ? (
                <VerificationPanel
                  user={selectedUser}
                  onVerify={handleVerify}
                  onReject={handleReject}
                />
              ) : (
                <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    Select a rejected user to view
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>}
    </div>
  )
}
