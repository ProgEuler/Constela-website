"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { CircleCheck, Clock, OctagonX } from "lucide-react"
import { toast } from "sonner"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import StatCard from "@/components/shared/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"

import { UserReviewCard } from "./_components/user-review-card"
import { VerificationPanel } from "./_components/verification-panel"
import { type VerificationUser } from "./_components/verification-data"

type VerificationData = {
  pending: any[];
  verified: any[];
  rejected: any[];
};

const colors = [
  "from-violet-500 to-fuchsia-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-rose-500",
  "from-pink-500 to-purple-500",
  "from-sky-500 to-indigo-500",
  "from-amber-500 to-red-500",
  "from-green-500 to-emerald-500",
]

function getColor(index: number) {
  return colors[index % colors.length]
}

function mapApiUser(u: any, index: number): VerificationUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    joinedDate: u.joined_date,
    status: u.status,
    profilePhotoUrl: u.profile_photo_url,
    selfieUrls: u.selfie_urls || [],
    initials: (u.name.substring(0, 2) || "U").toUpperCase(),
    color: getColor(index),
    location: u.location,
    submittedDate: u.submitted_date,
  };
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
          {
            label: "Pending",
            value: String(pendingUsers.length),
            change: "",
            icon: Clock,
            iconColor: "warning",
          },
          {
            label: "Verified",
            value: String(verifiedUsers.length),
            change: "",
            icon: CircleCheck,
            iconColor: "success",
          },
          {
            label: "Rejected",
            value: String(rejectedUsers.length),
            change: "",
            icon: OctagonX,
            iconColor: "destructive",
          },
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
          setActiveTab(value)
          if (value === "pending") setSelectedUser(pendingUsers[0] ?? undefined)
          else if (value === "verified") setSelectedUser(verifiedUsers[0] ?? undefined)
          else setSelectedUser(rejectedUsers[0] ?? undefined)
        }}
      >
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{pendingUsers.length}</span>
          </TabsTrigger>
          <TabsTrigger value="verified" className="gap-2">
            Verified <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{verifiedUsers.length}</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            Rejected <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{rejectedUsers.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {pendingUsers.length} users to review
                </span>
              </div>
              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
                {pendingUsers.map((user) => (
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
