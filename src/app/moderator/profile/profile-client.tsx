"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/actions/admin-actions";
import { useToast } from "@/components/ui/Toast";
import {
  User,
  Phone,
  Mail,
  Camera,
  Coins,
  ShieldCheck,
  Calendar,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProfileClientProps {
  dbUser: {
    name: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    points: number;
    profilePicture?: string;
    createdAt: string;
  };
}

export default function ProfileClient({ dbUser }: ProfileClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(dbUser.name);
  const [phone, setPhone] = useState(dbUser.phone);
  const [profilePicture, setProfilePicture] = useState(dbUser.profilePicture || "");

  // Base64 file reader for avatar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast("Image size should be less than 2MB.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast("Name and phone fields are required.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserProfile({
        name,
        phone,
        profilePicture,
      });

      if (res.success) {
        toast("Profile updated successfully!", "success");
        // Trigger Next.js router refresh to reload sidebar/navbar with new name/pic
        router.refresh();
      } else {
        toast(res.error || "Failed to update profile.", "error");
      }
    } catch (err) {
      toast("An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-slide-in">
      <div>
        <h1 className="text-xl font-black text-foreground">My Profile Settings</h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          View your system credentials and update your personal details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary Info Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
          
          {/* Profile Picture Uploader */}
          <div className="relative group mb-6">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/25 shadow-md bg-secondary flex items-center justify-center relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
            
            <label className="absolute -bottom-1.5 -right-1.5 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg border border-background cursor-pointer hover:scale-105 transition-transform duration-200">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <h3 className="font-black text-base text-foreground leading-none">{dbUser.name}</h3>
          <p className="text-[11px] text-muted-foreground font-semibold mt-1.5">@{dbUser.username}</p>

          <div className="w-full mt-6 pt-6 border-t border-border/40 space-y-4 text-xs font-semibold text-left">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">My Points Score</span>
              <span className="flex items-center gap-1 text-primary font-bold">
                <Coins className="w-3.5 h-3.5" />
                {dbUser.points} points
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Portal Access Role</span>
              <span className="flex items-center gap-1 text-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                {dbUser.role}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Account Status</span>
              <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 border border-green-500/15 font-bold text-[9px]">
                {dbUser.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Joined Date</span>
              <span className="text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                {formatDate(dbUser.createdAt).split(",")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Update Details Form */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm md:col-span-2">
          <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Update Profile Information
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Read-Only Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Username (Read-Only)</label>
                <input
                  type="text"
                  value={dbUser.username}
                  className="w-full px-4 py-2.5 bg-secondary/10 border border-border/40 rounded-xl text-sm text-muted-foreground cursor-not-allowed"
                  disabled
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email Address (Read-Only)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/50">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={dbUser.email}
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/10 border border-border/40 rounded-xl text-sm text-muted-foreground cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed pt-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Details...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Profile Details</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
