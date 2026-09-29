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
import { Edit2, Loader2, Check, X } from "lucide-react";

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Display Name
  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Email
  const [email, setEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Passwords
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any>("/api/profile/me/");
      setProfile(data);
      if (data?.user?.first_name) {
        setName(data.user.first_name);
      } else if (data?.user?.email) {
        setName(data.user.email.split("@")[0]);
      } else {
        setName("");
      }
      setEmail(data?.user?.email || "");
    } catch (err: any) {
      toast.error("Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Display name cannot be empty.");
      return;
    }
    setIsUpdatingName(true);
    try {
      const updated = await api.patch<any>("/api/profile/me/", { first_name: trimmed });
      toast.success("Name updated successfully!");
      setIsEditingName(false);
      const newName = updated?.user?.first_name || trimmed;
      setName(newName);
      setProfile((prev: any) => ({ ...prev, user: { ...prev?.user, first_name: newName } }));
    } catch (err: any) {
      toast.error(err?.message || "Failed to update name.");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleSaveEmail = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Email address cannot be empty.");
      return;
    }
    setIsUpdatingEmail(true);
    try {
      const updated = await api.patch<any>("/api/profile/me/", { email: trimmed });
      toast.success("Email updated successfully!");
      setIsEditingEmail(false);
      const newEmail = updated?.user?.email || trimmed;
      setEmail(newEmail);
      setProfile((prev: any) => ({ ...prev, user: { ...prev?.user, email: newEmail } }));
    } catch (err: any) {
      toast.error(err?.message || "Failed to update email.");
    } finally {
      setIsUpdatingEmail(false);
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
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
          <Avatar className="h-24 w-24 border">
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
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Email Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-slate-50/50">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-slate-700">Email Address</Label>
              <p className="text-sm text-slate-500">Used for login and system notifications</p>
            </div>
            <div className="flex items-center gap-2">
              {isEditingEmail ? (
                <>
                  <Input 
                    type="email"
                    className="w-[220px] h-9" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEmail();
                      if (e.key === "Escape") {
                        setEmail(profile?.user?.email || "");
                        setIsEditingEmail(false);
                      }
                    }}
                    autoFocus
                    placeholder="Enter new email..."
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => {
                      setEmail(profile?.user?.email || "");
                      setIsEditingEmail(false);
                    }} 
                    disabled={isUpdatingEmail}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button size="icon" onClick={handleSaveEmail} disabled={isUpdatingEmail || !email.trim()}>
                    {isUpdatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium px-2">{profile?.user?.email || "No email"}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setEmail(profile?.user?.email || "");
                      setIsEditingEmail(true);
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                    Update
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Display Name Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-slate-50/50">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-slate-700">Display Name</Label>
              <p className="text-sm text-slate-500">How you appear to others in the dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <>
                  <Input 
                    className="w-[220px] h-9" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setName(profile?.user?.first_name || profile?.user?.email?.split("@")[0] || "Admin");
                        setIsEditingName(false);
                      }
                    }}
                    autoFocus
                    placeholder="Enter display name..."
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => {
                      setName(profile?.user?.first_name || profile?.user?.email?.split("@")[0] || "Admin");
                      setIsEditingName(false);
                    }} 
                    disabled={isUpdatingName}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button size="icon" onClick={handleSaveName} disabled={isUpdatingName || !name.trim()}>
                    {isUpdatingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium px-2">{profile?.user?.first_name || name || "Admin"}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setName(profile?.user?.first_name || profile?.user?.email?.split("@")[0] || "Admin");
                      setIsEditingName(true);
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                    Update
                  </Button>
                </>
              )}
            </div>
          </div>

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
