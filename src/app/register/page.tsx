"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerModerator } from "@/actions/auth-actions";
import { useToast } from "@/components/ui/Toast";
import { Loader2, ShieldCheck, User, Mail, Phone, Lock, CheckCircle2 } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Full Name must be at least 2 characters."),
  username: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await registerModerator(values);
      if (res.success) {
        setIsSuccess(true);
        toast("Registration submitted for approval!", "success");
      } else {
        toast(res.error || "Registration failed.", "error", "Registration Error");
      }
    } catch (err) {
      toast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-violet-600/10 via-background to-indigo-600/10">
        <div className="w-full max-w-md bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-8 text-center shadow-2xl shadow-primary/5 animate-slide-in">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-3">Application Submitted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed px-4 mb-8">
            Thank you for registering! Your account has been created in <span className="font-bold text-foreground">Pending</span> status. An administrator must approve your profile before you can log in.
          </p>
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-violet-600/10 via-background to-indigo-600/10">
      <div className="w-full max-w-md bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-8 shadow-2xl shadow-primary/5">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-xl shadow-primary/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Moderator Registration
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Apply to become a system moderator
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-foreground/85 mb-1 uppercase tracking-wide">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                {...register("name")}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                placeholder="e.g. Sakib Al Hasan"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[10px] text-red-500 font-semibold">{errors.name.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-foreground/85 mb-1 uppercase tracking-wide">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                {...register("username")}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                placeholder="e.g. sakib_10"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-[10px] text-red-500 font-semibold">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-foreground/85 mb-1 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                {...register("email")}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                placeholder="e.g. sakib@moderator.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[10px] text-red-500 font-semibold">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-foreground/85 mb-1 uppercase tracking-wide">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                {...register("phone")}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                placeholder="e.g. 01700000000"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-[10px] text-red-500 font-semibold">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-foreground/85 mb-1 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                {...register("password")}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-[10px] text-red-500 font-semibold">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting registration...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        {/* Bottom login link */}
        <div className="mt-6 pt-4 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
