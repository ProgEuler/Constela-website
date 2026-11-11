export type VerificationStatus = "pending" | "verified" | "rejected"

export type VerificationUser = {
  id: string
  name: string
  email: string
  joinedDate: string
  status: VerificationStatus
  /** Main profile picture (first of profilePhotoUrls). */
  profilePhotoUrl: string
  /** All profile pictures, main first. */
  profilePhotoUrls: string[]
  /** The single live photo the user took in the app for verification. */
  selfieUrl: string
  initials: string
  color: string
  location?: string
  /** Rejection reason shown to the user. */
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
    bgClass: "border-destructive/20 bg-destructive/10 text-destructive",
    dotClass: "bg-destructive",
  },
}

/** One-click reasons for the reject dialog (shown to the user). */
export const QUICK_REJECT_REASONS = [
  "The person in the photo doesn't match your profile pictures.",
  "Your face isn't clearly visible. Please face the camera directly.",
  "The photo is too dark or blurry. Please retake it in good light.",
  "Please remove sunglasses, masks or anything covering your face.",
]

export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return ""
  if (path.startsWith("http")) return path
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`
}
