"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, API_BASE } from "@/lib/api";
import { getInitials } from "@/lib/utils";

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any>("/api/profile/me/");
      setProfile(data);
      setName(data.user?.first_name || data.user?.email?.split("@")[0] || "");
      setEmail(data.user?.email || "");
    } catch (err: any) {
      toast.error("Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdateName = async () => {
    if (!name.trim() || !email.trim()) return;
    setIsUpdatingName(true);
    try {
      await api.patch("/api/profile/me/", { first_name: name, email: email });
      toast.success("Profile updated successfully!");
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) return;
    setIsUpdatingPassword(true);
    try {
      await api.post("/api/settings/change-password/", { 
        old_password: oldPassword, 
        new_password: newPassword 
      });
      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const token = localStorage.getItem("admin_access_token");
      const formData = new FormData();
      formData.append("image_upload", file);
      
      const existingPhoto = profile?.photos?.[0];
      const method = existingPhoto ? "PATCH" : "POST";
      const url = existingPhoto 
        ? `${API_BASE}/api/photos/${existingPhoto.id}/`
        : `${API_BASE}/api/photos/`;
      
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!res.ok) {
        let msg = "Failed to upload photo";
        try {
           const b = await res.json();
           msg = b.detail || b.error || msg;
        } catch {}
        throw new Error(msg);
      }
      
      toast.success("Profile photo updated!");
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading profile...</div>;
  }

  const avatarUrl = profile?.photos?.[0]?.image || undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">Manage your admin profile settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your avatar.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-2xl">{getInitials(name || "Admin")}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="picture" className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-3 py-2 text-sm font-medium shadow transition-colors">
              {isUploadingPhoto ? "Uploading..." : "Upload new picture"}
            </Label>
            <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 5MB.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your name.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={(profile?.user?.role || "admin").toUpperCase()} disabled className="bg-muted font-medium" />
            <p className="text-[10px] text-muted-foreground">Your assigned system role.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button onClick={handleUpdateName} disabled={isUpdatingName || !name.trim()}>
            {isUpdatingName ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="old_password">Current Password</Label>
            <Input id="old_password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword || !oldPassword || !newPassword}>
            {isUpdatingPassword ? "Updating..." : "Update password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
