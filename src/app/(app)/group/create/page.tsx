"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: group, error: createError } = await supabase
      .from("groups")
      .insert({ name: name.trim(), created_by: user.id })
      .select()
      .single();

    if (createError || !group) {
      setError(createError?.message || "Failed to create group");
      setLoading(false);
      return;
    }

    // Add creator as member
    await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: user.id });

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
        <h1 className="text-xl font-bold text-white">Create a Squad</h1>
        <p className="text-sm text-slate-400 mt-1">
          Name your squad and share the invite code with friends
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-4">
        <Input
          id="name"
          label="Squad Name"
          placeholder="e.g. Morning Warriors"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          error={error}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Create Squad
        </Button>
      </form>
    </div>
  );
}
