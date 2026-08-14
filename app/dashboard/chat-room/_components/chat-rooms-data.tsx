export interface ChatRoom {
  id: string
  name: string
  description: string
  type: "public" | "private"
  memberCount: number
  messageCount: number
  createdAt: string
}

export interface ChatMember {
  id: string
  name: string
  email: string
  initials: string
  avatarBg: string
  avatar?: string
  role: "admin" | "moderator" | "member"
  joinedAt: string
}

export interface ChatRoomDetail extends ChatRoom {
  members: ChatMember[]
}

export const chatRooms: ChatRoom[] = [
  {
    id: "1",
    name: "General Discussion",
    description: "A place for everyone to chat about anything and everything.",
    type: "public",
    memberCount: 156,
    messageCount: 1240,
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    name: "Tech Support",
    description: "Get help with technical issues and troubleshooting.",
    type: "public",
    memberCount: 89,
    messageCount: 567,
    createdAt: "2025-02-03",
  },
  {
    id: "3",
    name: "Premium Members",
    description: "Exclusive room for premium subscribers.",
    type: "private",
    memberCount: 42,
    messageCount: 320,
    createdAt: "2025-03-10",
  },
  {
    id: "4",
    name: "Events & Meetups",
    description: "Plan and discuss upcoming community events and meetups.",
    type: "public",
    memberCount: 203,
    messageCount: 891,
    createdAt: "2025-01-20",
  },
  {
    id: "5",
    name: "Moderator Chat",
    description: "Internal communication for moderators only.",
    type: "private",
    memberCount: 12,
    messageCount: 445,
    createdAt: "2025-04-01",
  },
]

export const roomDetails: Record<string, ChatRoomDetail> = {
  "1": {
    id: "1",
    name: "General Discussion",
    description: "A place for everyone to chat about anything and everything.",
    type: "public",
    memberCount: 156,
    messageCount: 1240,
    createdAt: "2025-01-15",
    members: [
      {
        id: "m1",
        name: "Alice Johnson",
        email: "alice.j@email.com",
        initials: "AJ",
        avatarBg: "bg-purple-500",
        role: "admin",
        joinedAt: "Jan 2025",
      },
      {
        id: "m2",
        name: "Bob Williams",
        email: "bob.w@email.com",
        initials: "BW",
        avatarBg: "bg-blue-500",
        role: "moderator",
        joinedAt: "Jan 2025",
      },
      {
        id: "m3",
        name: "Carol Davis",
        email: "carol.d@email.com",
        initials: "CD",
        avatarBg: "bg-emerald-500",
        role: "member",
        joinedAt: "Feb 2025",
      },
      {
        id: "m4",
        name: "David Brown",
        email: "david.b@email.com",
        initials: "DB",
        avatarBg: "bg-amber-500",
        role: "member",
        joinedAt: "Mar 2025",
      },
      {
        id: "m5",
        name: "Eve Martinez",
        email: "eve.m@email.com",
        initials: "EM",
        avatarBg: "bg-rose-500",
        role: "moderator",
        joinedAt: "Jan 2025",
      },
      {
        id: "m6",
        name: "Frank Wilson",
        email: "frank.w@email.com",
        initials: "FW",
        avatarBg: "bg-cyan-500",
        role: "member",
        joinedAt: "Apr 2025",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Tech Support",
    description: "Get help with technical issues and troubleshooting.",
    type: "public",
    memberCount: 89,
    messageCount: 567,
    createdAt: "2025-02-03",
    members: [
      {
        id: "m7",
        name: "Grace Lee",
        email: "grace.l@email.com",
        initials: "GL",
        avatarBg: "bg-orange-500",
        role: "admin",
        joinedAt: "Feb 2025",
      },
      {
        id: "m8",
        name: "Henry Kim",
        email: "henry.k@email.com",
        initials: "HK",
        avatarBg: "bg-teal-500",
        role: "member",
        joinedAt: "Feb 2025",
      },
      {
        id: "m9",
        name: "Ivy Chen",
        email: "ivy.c@email.com",
        initials: "IC",
        avatarBg: "bg-pink-500",
        role: "member",
        joinedAt: "Mar 2025",
      },
    ],
  },
  "3": {
    id: "3",
    name: "Premium Members",
    description: "Exclusive room for premium subscribers.",
    type: "private",
    memberCount: 42,
    messageCount: 320,
    createdAt: "2025-03-10",
    members: [
      {
        id: "m10",
        name: "Jack Taylor",
        email: "jack.t@email.com",
        initials: "JT",
        avatarBg: "bg-indigo-500",
        role: "admin",
        joinedAt: "Mar 2025",
      },
      {
        id: "m11",
        name: "Karen White",
        email: "karen.w@email.com",
        initials: "KW",
        avatarBg: "bg-lime-500",
        role: "member",
        joinedAt: "Mar 2025",
      },
    ],
  },
  "4": {
    id: "4",
    name: "Events & Meetups",
    description: "Plan and discuss upcoming community events and meetups.",
    type: "public",
    memberCount: 203,
    messageCount: 891,
    createdAt: "2025-01-20",
    members: [
      {
        id: "m12",
        name: "Leo Garcia",
        email: "leo.g@email.com",
        initials: "LG",
        avatarBg: "bg-violet-500",
        role: "moderator",
        joinedAt: "Jan 2025",
      },
      {
        id: "m13",
        name: "Mia Anderson",
        email: "mia.a@email.com",
        initials: "MA",
        avatarBg: "bg-rose-400",
        role: "member",
        joinedAt: "Feb 2025",
      },
      {
        id: "m14",
        name: "Noah Thomas",
        email: "noah.t@email.com",
        initials: "NT",
        avatarBg: "bg-sky-500",
        role: "member",
        joinedAt: "Feb 2025",
      },
      {
        id: "m15",
        name: "Olivia Jackson",
        email: "olivia.j@email.com",
        initials: "OJ",
        avatarBg: "bg-fuchsia-500",
        role: "member",
        joinedAt: "Mar 2025",
      },
    ],
  },
  "5": {
    id: "5",
    name: "Moderator Chat",
    description: "Internal communication for moderators only.",
    type: "private",
    memberCount: 12,
    messageCount: 445,
    createdAt: "2025-04-01",
    members: [
      {
        id: "m16",
        name: "Quinn Roberts",
        email: "quinn.r@email.com",
        initials: "QR",
        avatarBg: "bg-red-500",
        role: "admin",
        joinedAt: "Apr 2025",
      },
      {
        id: "m17",
        name: "Rachel Turner",
        email: "rachel.t@email.com",
        initials: "RT",
        avatarBg: "bg-emerald-400",
        role: "moderator",
        joinedAt: "Apr 2025",
      },
    ],
  },
}
