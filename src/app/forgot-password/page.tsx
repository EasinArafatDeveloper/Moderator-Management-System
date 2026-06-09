"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/actions/auth-actions";
import { useToast } from "@/components/ui/Toast";
import { Loader2, ShieldCheck, Mail, ArrowLeft, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast("Please enter your email.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.success) {
        toast("Reset link generated!", "success");
        if (res.resetLink) {
          setResetLink(res.resetLink);
        }
      } else {
        toast(res.error || "Failed to generate link.", "error");
      }
    } catch (err) {
      toast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-violet-600/10 via-background to-indigo-600/10">
      <div className="w-full max-w-md bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-8 shadow-2xl shadow-primary/5">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-xl shadow-primary/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Forgot Password
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Request a secure password reset link
          </p>
        </div>

        {resetLink ? (
          <div className="space-y-6 text-center animate-slide-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 mx-auto">
              <KeyRound className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Reset Link Generated Successfully!</p>
              <p className="text-xs text-muted-foreground mt-2 px-2">
                Since this is a local environment, click the button below to navigate to the reset page:
              </p>
            </div>
            <Link
              href={resetLink}
              className="block w-full py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary-dark transition-all duration-200"
            >
              Reset Password Now
            </Link>
            <button
              onClick={() => {
                setResetLink(null);
                setEmail("");
              }}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Request another link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-foreground/85 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  placeholder="e.g. sakib@moderator.com"
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
                  <span>Generating link...</span>
                </>
              ) : (
                <span>Request Reset Link</span>
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
      </div>
    </div>
  );
}
