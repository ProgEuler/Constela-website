export type VerificationStatus = "pending" | "verified" | "rejected"

export type VerificationUser = {
  id: string
  name: string
  email: string
  joinedDate: string
  status: VerificationStatus
  profilePhotoUrl: string
  selfieUrls: string[]
  initials: string
  color: string
  location?: string
  reason?: string
  submittedDate: string
}

export const statusMeta: Record<
  VerificationStatus,
  { label: string; color: string; bgClass: string; dotClass: string }
> = {
  pending: {
    label: "Pending",
    color: "amber",
    bgClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dotClass: "bg-amber-500",
  },
  verified: {
    label: "Verified",
    color: "emerald",
    bgClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    color: "red",
    bgClass:
      "border-destructive/20 bg-destructive/10 text-destructive",
    dotClass: "bg-destructive",
  },
}

// Placeholder gradient colors for photo simulation
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

export const verificationUsers: VerificationUser[] = [
  {
    id: "V001",
    name: "Olivia Rhye",
    email: "olivia.rhye@weblabs.studio",
    joinedDate: "24 Jun 2024",
    status: "pending",
    profilePhotoUrl: "",
    selfieUrls: [],
    initials: "OR",
    color: getColor(0),
    location: "New York, USA",
    submittedDate: "2 hours ago",
  },
  {
    id: "V002",
    name: "Phoenix Baker",
    email: "phoenix.baker@weblabs.studio",
    joinedDate: "15 Mar 2023",
    status: "pending",
    profilePhotoUrl: "",
    selfieUrls: [],
    initials: "PB",
    color: getColor(1),
    location: "San Francisco, USA",
    submittedDate: "4 hours ago",
  },
  {
    id: "V003",
    name: "Lana Steiner",
    email: "lana.steiner@acme.inc",
    joinedDate: "10 Apr 2022",
    status: "pending",
    profilePhotoUrl: "",
    selfieUrls: [],
    initials: "LS",
    color: getColor(2),
    location: "Austin, USA",
    submittedDate: "6 hours ago",
  },
  {
    id: "V004",
    name: "Demi Wilkinson",
    email: "demi.wilkinson@weblabs.studio",
    joinedDate: "28 Feb 2023",
    status: "pending",
    profilePhotoUrl: "",
    selfieUrls: [],
    initials: "DW",
    color: getColor(3),
    location: "New York, USA",
    submittedDate: "8 hours ago",
  },
  {
    id: "V005",
    name: "Candice Wu",
    email: "candice.wu@sandbox.dev",
    joinedDate: "19 May 2024",
    status: "pending",
    profilePhotoUrl: "",
    selfieUrls: [],
    initials: "CW",
    color: getColor(4),
    location: "Seattle, USA",
    submittedDate: "12 hours ago",
  },
  {
    id: "V006",
    name: "Natali Craig",
    email: "natali.craig@weblabs.studio",
    joinedDate: "03 Jan 2024",
    status: "verified",
    profilePhotoUrl: "",
    selfieUrls: [],
    initials: "NC",
    color: getColor(5),
    location: "San Diego, USA",
    submittedDate: "1 day ago",
  },
  {
    id: "V007",
    name: "Drew Cano",
    email: "drew.cano@internal.tools",
    joinedDate: "21 Jul 2023",
    status: "verified",
    profilePhotoUrl: "",
    selfieUrls: [],
    initials: "DC",
    color: getColor(6),
    location: "Chicago, USA",
    submittedDate: "2 days ago",
  },
  {
    id: "V008",
    name: "Andi Lane",
    email: "andi.lane@weblabs.studio",
    joinedDate: "04 Nov 2022",
    status: "verified",
    profilePhotoUrl: "",
    selfieUrls: [],
    initials: "AL",
    color: getColor(7),
    location: "Portland, USA",
    submittedDate: "3 days ago",
  },
  {
    id: "V009",
    name: "Kate Morrison",
    email: "kate.morrison@weblabs.studio",
    joinedDate: "30 Dec 2023",
    status: "rejected",
    profilePhotoUrl: "",
    selfieUrls: [],
    initials: "KM",
    color: getColor(0),
    location: "Boston, USA",
    reason: "Photo does not match profile",
    submittedDate: "4 days ago",
  },
  {
    id: "V010",
    name: "Steven Tey",
    email: "steven.tey@sandbox.dev",
    joinedDate: "17 Jan 2024",
    status: "rejected",
    profilePhotoUrl: "",
    selfieUrls: [],
    initials: "ST",
    color: getColor(1),
    location: "Denver, USA",
    reason: "Blurry image, resubmit required",
    submittedDate: "5 days ago",
  },
]

export const pendingUsers = verificationUsers.filter(
  (u) => u.status === "pending"
)
export const verifiedUsers = verificationUsers.filter(
  (u) => u.status === "verified"
)
export const rejectedUsers = verificationUsers.filter(
  (u) => u.status === "rejected"
)
