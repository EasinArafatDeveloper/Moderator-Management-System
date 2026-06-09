"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { resetPassword } from "@/actions/auth-actions";
import { useToast } from "@/components/ui/Toast";
import { Loader2, ShieldCheck, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get("token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast("Invalid or missing reset token.", "error");
      return;
    }

    if (password.length < 6) {
      toast("Password must be at least 6 characters.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      toast("Passwords do not match.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setIsSuccess(true);
        toast("Password reset successfully!", "success");
      } else {
        toast(res.error || "Reset failed.", "error");
      }
    } catch (err) {
      toast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center animate-slide-in">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 text-green-500 mx-auto">
          <CheckCircle2 className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Password Reset Complete!</p>
          <p className="text-xs text-muted-foreground mt-2">
            You can now log in to the Moderator Management System using your new password.
          </p>
        </div>
        <Link
          href="/login"
          className="block w-full py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200"
        >
          Proceed to Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-xl shadow-primary/25">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Reset Password
        </h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Enter your new password below
        </p>
      </div>

      {!token ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs text-center font-semibold mb-6">
          Missing or invalid reset token. Please request a new link.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-foreground/85 mb-1.5 uppercase tracking-wide">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-foreground/85 mb-1.5 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-border/40 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-violet-600/10 via-background to-indigo-600/10">
      <div className="w-full max-w-md bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-8 shadow-2xl shadow-primary/5">
        <Suspense fallback={
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
