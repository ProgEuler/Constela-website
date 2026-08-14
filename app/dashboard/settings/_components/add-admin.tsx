"use client"

import * as React from "react"
import { Check, Plus } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getInitials } from "@/lib/utils"

const ROLES = ["Admin", "Moderator", "Super Admin", "Customer Support"] as const
type Role = (typeof ROLES)[number]

type AddAdminDialogProps = {
  trigger?: React.ReactNode
  currentUserRole?: string
  onCreate?: (data: { name: string; email: string; role: Role; password: string }) => void
}

export function AddAdminDialog({ trigger, currentUserRole, onCreate }: AddAdminDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  
  // Available roles depend on current user
  const isSuper = currentUserRole === "superadmin"
  const availableRoles = ROLES.filter(r => isSuper || (r !== "Admin" && r !== "Super Admin"))
  
  const [role, setRole] = React.useState<Role>(isSuper ? "Admin" : "Customer Support")
  const [password, setPassword] = React.useState("")

  React.useEffect(() => {
    if (!open) {
      setName("")
      setEmail("")
      setRole(isSuper ? "Admin" : "Customer Support")
      setPassword("")
    }
  }, [open])

  const previewName = name.trim() || "New Admin"
  const previewEmail = email.trim() || "email@example.com"

  const handleCreate = () => {
    onCreate?.({ name, email, role, password })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus />
            Add New Admin
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Add New Admin</DialogTitle>
          <DialogDescription>
            Create a new admin account with role-based access
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
          <Avatar size="lg" className="bg-muted text-muted-foreground">
            <AvatarFallback className="bg-muted text-muted-foreground font-medium">
              {getInitials(previewName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{previewName}</span>
            <span className="text-muted-foreground text-xs">{previewEmail}</span>
            <Badge variant="secondary" className="mt-1 w-fit">
              {role}
            </Badge>
          </div>
        </div>

        <Field>
          <FieldLabel htmlFor="add-admin-name">
            Full Name <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="add-admin-name"
            placeholder="e.g. Sophie Martin"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="add-admin-email">
            Email Address <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="add-admin-email"
            type="email"
            placeholder="admin@atypical.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="add-admin-role">Role</FieldLabel>
          <Select value={role} onValueChange={(val) => setRole(val as Role)}>
            <SelectTrigger id="admin-role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="add-admin-password">
            Temporary Password <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="add-admin-password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
          <p className="text-muted-foreground text-xs">
            The user will be prompted to change this on first login.
          </p>
        </Field>

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="flex-1"
            disabled={!name.trim() || !email.trim() || password.length < 8}
            onClick={handleCreate}
          >
            <Check />
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
