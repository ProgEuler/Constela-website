"use client"

import * as React from "react"
import { Check } from "lucide-react"

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

export type AdminUser = {
  id?: string
  name: string
  email: string
  role: Role
}

type EditAdminDialogProps = {
  admin: AdminUser
  trigger?: React.ReactNode
  currentUserRole?: string
  onSave?: (data: AdminUser) => void
}

export function EditAdminDialog({ admin, trigger, currentUserRole, onSave }: EditAdminDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(admin.name)
  const [email, setEmail] = React.useState(admin.email)
  
  const isSuper = currentUserRole === "superadmin"
  const availableRoles = ROLES.filter(r => isSuper || (r !== "Admin" && r !== "Super Admin"))
  
  const [role, setRole] = React.useState<Role>(admin.role)

  React.useEffect(() => {
    if (open) {
      setName(admin.name)
      setEmail(admin.email)
      setRole(admin.role)
    }
  }, [open, admin])

  const previewName = name.trim() || admin.name
  const previewEmail = email.trim() || admin.email

  const handleSave = () => {
    onSave?.({ ...admin, name, email, role })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Admin Account</DialogTitle>
          <DialogDescription>Editing Admin User</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
          <Avatar
            size="lg"
            className="bg-emerald-700 text-white [&_[data-slot=avatar-fallback]]:bg-emerald-700 [&_[data-slot=avatar-fallback]]:text-white"
          >
            <AvatarFallback className="font-medium">
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
          <FieldLabel htmlFor={`edit-admin-name-${admin.id ?? admin.email}`}>
            Full Name <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id={`edit-admin-name-${admin.id ?? admin.email}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={`edit-admin-email-${admin.id ?? admin.email}`}>
            Email Address <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id={`edit-admin-email-${admin.id ?? admin.email}`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={`edit-admin-role-${admin.id ?? admin.email}`}>
            Role
          </FieldLabel>
          <Select value={role} onValueChange={(value) => setRole(value as Role)}>
            <SelectTrigger id="edit-admin-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="flex-1"
            disabled={!name.trim() || !email.trim()}
            onClick={handleSave}
          >
            <Check />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
