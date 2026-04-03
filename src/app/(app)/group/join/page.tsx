"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function JoinGroupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Find group by invite code
    const { data: group } = await supabase
      .from("groups")
      .select("id")
      .eq("invite_code", code.trim().toLowerCase())
      .single();

    if (!group) {
      setError("No squad found with that invite code");
      setLoading(false);
      return;
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      setError("You're already in this squad!");
      setLoading(false);
      return;
    }

    // Join
    const { error: joinError } = await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: user.id });

    if (joinError) {
      setError("Failed to join squad");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/group");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      <Link
        href="/group"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div>
        <h1 className="text-xl font-bold text-white">Join a Squad</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter the invite code shared by your friend
        </p>
      </div>

      <form onSubmit={handleJoin} className="space-y-4">
        <Input
          id="code"
          label="Invite Code"
          placeholder="e.g. a1b2c3d4"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          error={error}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Join Squad
        </Button>
      </form>
    </div>
  );
}
