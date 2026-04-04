"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
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
            Enter your email and password
          </p>
        </div>

        <form onSubmit={handleLogin} method="POST" action="#" className="space-y-4" data-1p-fill="true">
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            autoComplete="username email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-1p-ignore={false}
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-xs text-slate-500 hover:text-orange-400"
            >
              Forgot your password?
            </Link>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-orange-500 hover:text-orange-400 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
