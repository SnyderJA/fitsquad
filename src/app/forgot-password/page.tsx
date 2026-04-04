"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, ArrowLeft, Mail, Check } from "lucide-react";
import Link from "next/link";

type Step = "email" | "code" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/send-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setStep("code");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send code");
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/verify-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });

    setLoading(false);

    const data = await res.json();

    if (res.ok) {
      setStep("success");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(data.error || "Failed to reset password");
    }
  }

  if (step === "success") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Password updated!</h1>
            <p className="text-sm text-slate-400">
              Redirecting to sign in...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (step === "code") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <button
            onClick={() => setStep("email")}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 mb-4">
              <Mail className="h-6 w-6 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Check your email</h1>
            <p className="text-sm text-slate-400">
              We sent a 6-digit code to{" "}
              <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Input
              id="code"
              label="Reset Code"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              className="text-center text-2xl tracking-[0.3em] font-bold"
            />
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={code.length !== 6}
            >
              Reset Password
            </Button>
          </form>

          <button
            onClick={() => {
              setError("");
              handleSendCode(new Event("submit") as unknown as React.FormEvent);
            }}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-400"
          >
            Didn&apos;t get the code? Send again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500">
            <Dumbbell className="h-6 w-6" />
            <span className="text-lg font-bold text-white">FitSquad</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-sm text-slate-400">
            Enter your email and we&apos;ll send you a reset code
          </p>
        </div>

        <form onSubmit={handleSendCode} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Send Reset Code
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-orange-500 hover:text-orange-400 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
