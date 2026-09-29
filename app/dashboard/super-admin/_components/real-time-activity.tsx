"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, Heart, MessageSquare, Crown, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Activity = {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  details: string;
};

const activityIconMap: Record<string, { icon: React.ElementType, bgClass: string, textClass: string }> = {
  user_registered: { icon: UserPlus, bgClass: "bg-emerald-100 dark:bg-emerald-950", textClass: "text-emerald-600 dark:text-emerald-400" },
  match_created: { icon: Heart, bgClass: "bg-orange-100 dark:bg-orange-950", textClass: "text-orange-600 dark:text-orange-400" },
  message_sent: { icon: MessageSquare, bgClass: "bg-emerald-100 dark:bg-emerald-950", textClass: "text-emerald-600 dark:text-emerald-400" },
  subscription_purchased: { icon: Crown, bgClass: "bg-yellow-100 dark:bg-yellow-950", textClass: "text-yellow-600 dark:text-yellow-400" },
  report_submitted: { icon: AlertCircle, bgClass: "bg-red-100 dark:bg-red-950", textClass: "text-red-600 dark:text-red-400" },
};

export function RealTimeActivity() {
  const { data, error, isLoading } = useSWR<Activity[]>("/api/admin/dashboard/activity/", {
    refreshInterval: 30_000,
  });
  const activities = data ?? [];

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to load real-time activity.", { id: "activity-load" });
  }, [error]);

  return (
    <Card className="flex flex-col h-full border-dashed border-2">
      <CardHeader>
        <CardTitle className="text-xl">Real-time Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-6 pr-6 pl-6">
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Loading activity...</p>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            activities.slice(0, 10).map((activity) => {
              const meta = activityIconMap[activity.type] || {
                icon: UserPlus,
                bgClass: "bg-gray-100 dark:bg-gray-800",
                textClass: "text-gray-600 dark:text-gray-400",
              };
              const Icon = meta.icon;

              return (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className={cn("flex items-center justify-center size-10 rounded-full", meta.bgClass)}>
                    <Icon className={cn("size-5", meta.textClass)} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
