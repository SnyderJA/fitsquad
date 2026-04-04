"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Check } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkDone, setCheckDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let resolved = false;

    function markReady() {
      if (!resolved) {
        resolved = true;
        setSessionReady(true);
        setCheckDone(true);
      }
    }

    function markFailed() {
      if (!resolved) {
        resolved = true;
        setCheckDone(true);
      }
    }

    // Listen for auth state changes — PASSWORD_RECOVERY fires when
    // Supabase processes the recovery token from the URL hash
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        markReady();
      }
    });

    // Also check if there's already an active session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        markReady();
      }
    });

    // If nothing fires after 5 seconds, mark as failed
    const timeout = setTimeout(() => {
      markFailed();
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Password updated!
            </h1>
            <p className="text-sm text-slate-400">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!sessionReady && !checkDone) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-sm space-y-6">
          <Dumbbell className="h-8 w-8 animate-pulse text-orange-500 mx-auto" />
          <p className="text-sm text-slate-400">Verifying reset link...</p>
        </div>
      </main>
    );
  }

  if (!sessionReady && checkDone) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-sm space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Link expired</h1>
            <p className="text-sm text-slate-400">
              This password reset link is no longer valid. Please request a new
              one.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-orange-500 hover:text-orange-400 font-medium"
          >
            Request new reset link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500">
            <Dumbbell className="h-6 w-6" />
            <span className="text-lg font-bold text-white">FitSquad</span>
          </div>
          <h1 className="text-2xl font-bold text-white">New password</h1>
          <p className="text-sm text-slate-400">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="password"
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Update Password
          </Button>
        </form>
      </div>
    </main>
  );
}
