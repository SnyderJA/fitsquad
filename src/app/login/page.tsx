"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
            <Mail className="h-8 w-8 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Check your email</h1>
            <p className="text-sm text-slate-400">
              We sent a magic link to{" "}
              <span className="text-white font-medium">{email}</span>
            </p>
          </div>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-orange-500 hover:text-orange-400"
          >
            Try a different email
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500">
            <Dumbbell className="h-6 w-6" />
            <span className="text-lg font-bold text-white">FitSquad</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
          <p className="text-sm text-slate-400">
            Enter your email and we&apos;ll send you a magic link
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={error}
          />
          <Button type="submit" className="w-full" loading={loading}>
            Send Magic Link
          </Button>
        </form>
      </div>
    </main>
  );
}
