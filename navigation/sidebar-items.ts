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
} from "lucide-react"

export interface NavSubItem {
  title: string
  url: string
  icon?: LucideIcon
  comingSoon?: boolean
  newTab?: boolean
  isNew?: boolean
}

export interface NavMainItem {
  title: string
  url: string
  icon?: LucideIcon
  subItems?: NavSubItem[]
  comingSoon?: boolean
  newTab?: boolean
  isNew?: boolean
}

export interface NavGroup {
  id: number
  label?: string
  items: NavMainItem[]
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    items: [
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Matches",
        url: "/dashboard/matches",
        icon: Heart,
      },
      {
        title: "Customer Support",
        url: "/dashboard/support/support-tickets",
        icon: TicketCheck,
      },
      {
        title: "Subscriptions",
        url: "/dashboard/subscriptions",
        icon: CreditCard,
      },
      {
        title: "Payments",
        url: "/dashboard/payments",
        icon: DollarSign,
      },
      {
        title: "Reports",
        url: "/dashboard/reports",
        icon: Signal,
      },
      {
        title: "Moderation",
        url: "/dashboard/moderation",
        icon: Shield,
      },
      {
        title: "Chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
]
