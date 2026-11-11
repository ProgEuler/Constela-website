import {
  CreditCard,
  DollarSign,
  Heart,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Settings,
  Shield,
  Signal,
  Users,
  TicketCheck,
  Camera,
  Eye,
  ClipboardList,
  FileText,
} from "lucide-react"

export type RoleSlug = "super-admin" | "admin" | "moderator" | "support"

export interface RoleNavItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface RoleConfig {
  slug: RoleSlug
  label: string
  description: string
  icon: LucideIcon
  color: string
  navItems: RoleNavItem[]
}

export const roles: RoleConfig[] = [
  {
    slug: "super-admin",
    label: "Super Admin",
    description:
      "Full access to all system features, settings, and user management.",
    icon: Shield,
    color: "from-red-500 to-rose-600",
    navItems: [
      {
        title: "Dashboard",
        url: "/dashboard/super-admin",
        icon: LayoutDashboard,
      },
      { title: "Users", url: "/dashboard/users", icon: Users },
      { title: "Matches", url: "/dashboard/matches", icon: Heart },
      {
        title: "Subscriptions",
        url: "/dashboard/subscriptions",
        icon: CreditCard,
      },
      { title: "Payments", url: "/dashboard/payments", icon: DollarSign },
      { title: "Reports", url: "/dashboard/reports", icon: Signal },
      { title: "Moderation", url: "/dashboard/moderation", icon: Shield },
      { title: "Chat Rooms", url: "/dashboard/chat-room", icon: MessageSquare },
      { title: "Customer Support", url: "/dashboard/support/support-tickets", icon: TicketCheck },
      { title: "Photo Verification", url: "/dashboard/photo-verification", icon: Camera },
      { title: "System Logs", url: "/dashboard/system-logs", icon: FileText },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
  },
  {
    slug: "admin",
    label: "Admin",
    description: "Manage users, content, moderation, and platform settings.",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
    navItems: [
      { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
      { title: "Users", url: "/dashboard/users", icon: Users },
      { title: "Matches", url: "/dashboard/matches", icon: Heart },
      {
        title: "Subscriptions",
        url: "/dashboard/subscriptions",
        icon: CreditCard,
      },
      { title: "Payments", url: "/dashboard/payments", icon: DollarSign },
      { title: "Customer Support", url: "/dashboard/support/support-tickets", icon: TicketCheck },
      { title: "Chat Rooms", url: "/dashboard/chat-room", icon: MessageSquare },
      { title: "Moderation", url: "/dashboard/moderation", icon: Shield },
      { title: "Photo Verification", url: "/dashboard/photo-verification", icon: Camera },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
  },
  {
    slug: "moderator",
    label: "Moderator",
    description:
      "Review reports, verify photos, and monitor platform activity.",
    icon: Eye,
    color: "from-emerald-500 to-teal-600",
    navItems: [
      {
        title: "Dashboard",
        url: "/dashboard/moderator",
        icon: LayoutDashboard,
      },
      { title: "Reports", url: "/dashboard/reports", icon: Signal },
      {
        title: "Photo Verification",
        url: "/dashboard/photo-verification",
        icon: Camera,
      },
    ],
  },
  {
    slug: "support",
    label: "Support",
    description: "View and respond to support tickets and user inquiries.",
    icon: TicketCheck,
    color: "from-amber-500 to-orange-600",
    navItems: [
      {
        title: "Overview",
        url: "/dashboard/support",
        icon: ClipboardList,
      },
      {
        title: "Support Tickets",
        url: "/dashboard/support/support-tickets",
        icon: TicketCheck,
      },
    ],
  },
]

export function getNavItemsForRole(slug: RoleSlug): RoleNavItem[] {
  const role = roles.find((r) => r.slug === slug)
  return role?.navItems ?? []
}
