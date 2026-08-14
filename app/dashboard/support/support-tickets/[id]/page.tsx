"use client"
import { useEffect, useState, useCallback } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Mail, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatDistanceToNow, format } from "date-fns"

type Ticket = {
  id: string
  user: string
  user_name: string
  user_email: string
  email: string
  subject: string
  description: string
  status: string
  priority: string
  created_at: string
  replies?: {
    id: string
    sender: string
    sender_email: string
    content: string
    created_at: string
  }[]
}

const STATUS_STYLES: Record<string, string> = {
  received: "bg-blue-50 text-blue-700",
  in_progress: "bg-emerald-50 text-emerald-700",
  resolved: "bg-gray-100 text-gray-700",
}

export default function SupportBox() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.get<Ticket>(`/api/admin/tickets/${id}/`)
      setTicket(data)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load ticket.")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleReply = async () => {
    if (!replyText.trim()) return
    setIsSubmitting(true)
    try {
      await api.post(`/api/admin/tickets/${id}/reply/`, { content: replyText })
      toast.success("Reply sent successfully!")
      setReplyText("")
      load() // Refresh to get any updates (like if it implicitly resolves)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send reply.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolve = async () => {
    try {
      await api.patch(`/api/admin/tickets/${id}/`, { status: "resolved" })
      toast.success("Ticket resolved!")
      load()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to resolve ticket.")
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading ticket details...</div>
  }

  if (!ticket) {
    return <div className="p-8 text-center text-red-500">Ticket not found</div>
  }

  const statusStyle = STATUS_STYLES[ticket.status?.toLowerCase()] ?? STATUS_STYLES.received
  const initial = ticket.user_name ? ticket.user_name.charAt(0).toUpperCase() : "U"

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-2 gap-2 pl-0"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Tickets{" "}
        <span className="ml-2 font-normal text-muted-foreground">#{ticket.id.slice(0, 8)}</span>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex w-full items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{ticket.user_name || "Unknown User"}</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {ticket.user_email || ticket.email}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b pb-4">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              STATUS
            </span>
            <Badge
              variant="outline"
              className={`border-transparent font-medium shadow-none ${statusStyle}`}
            >
              {ticket.status.replace("_", " ").charAt(0).toUpperCase() + ticket.status.replace("_", " ").slice(1)}
            </Badge>
          </div>

          <h2 className="text-lg font-bold">
            {ticket.subject}
          </h2>

          <div className="rounded-2xl bg-[#f8f6f3] p-5 dark:bg-muted/40 whitespace-pre-wrap">
            <p className="text-[15px] leading-relaxed text-foreground/90">
              {ticket.description}
            </p>
          </div>
          <p className="px-2 text-xs text-muted-foreground">
            {ticket.user_name || "User"} - {format(new Date(ticket.created_at), "HH:mm")}
          </p>

          {ticket.replies && ticket.replies.length > 0 && (
            <div className="mt-8 space-y-6">
              {ticket.replies.map((reply) => (
                <div key={reply.id} className="ml-8 rounded-2xl bg-emerald-50/80 p-5 dark:bg-emerald-950/20 whitespace-pre-wrap">
                  <p className="text-[15px] leading-relaxed text-foreground/90">
                    {reply.content}
                  </p>
                  <p className="mt-2 text-right text-xs text-muted-foreground">
                    Support ({reply.sender_email}) - {format(new Date(reply.created_at), "HH:mm")}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Card className="mt-8 rounded-xl border p-4 shadow-sm">
            <Textarea
              placeholder="Type your reply...&#10;It will be sent to user's email"
              className="min-h-[120px] resize-none border-none px-2 py-1 text-[15px] shadow-none focus-visible:ring-0"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> Reply will be sent to{" "}
                {ticket.email || ticket.user_email}
              </span>
              <div className="flex gap-3">
                {ticket.status !== "resolved" && (
                  <Button
                    variant="outline"
                    className="h-9 cursor-pointer rounded-full border-red-200 px-4 text-xs font-medium text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={handleResolve}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Close Ticket
                  </Button>
                )}
                <Button 
                  className="h-9 cursor-pointer rounded-full bg-[#85a39a] px-4 text-xs font-medium text-white shadow-none hover:bg-[#729288]"
                  onClick={handleReply}
                  disabled={isSubmitting || !replyText.trim()}
                >
                  {isSubmitting ? "Sending..." : "Send Reply"} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col items-center rounded-xl border p-8 text-center shadow-sm">
            <Avatar className="mb-4 h-16 w-16">
              <AvatarFallback className="bg-[#1e4640] text-xl font-medium text-white">
                {initial}
              </AvatarFallback>
            </Avatar>
            <h3 className="mb-1 text-lg leading-tight font-bold">
              {ticket.user_name || "Unknown User"}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {ticket.user_email || ticket.email}
            </p>

            <Badge
              variant="outline"
              className="mb-4 rounded-full border-transparent bg-emerald-50 px-4 font-medium text-emerald-700 shadow-none"
            >
              Active
            </Badge>

          </Card>

          <Card className="rounded-xl border p-6 shadow-sm">
            <h3 className="mb-5 text-sm font-bold">Ticket info</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-semibold text-foreground/90" title={ticket.id}>#{ticket.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Received</span>
                <span className="font-semibold text-foreground/90">
                  {format(new Date(ticket.created_at), "yyyy-MM-dd HH:mm")}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
