"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StreakBadge } from "@/components/streak-badge";
import {
  User,
  LogOut,
  Trophy,
  Dumbbell,
  Flame,
  Save,
} from "lucide-react";
import { DEMO_MODE, DEMO_PROFILE, DEMO_STREAK } from "@/lib/demo-data";
import type { Profile, Streak } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (DEMO_MODE) {
        setProfile(DEMO_PROFILE);
        setDisplayName(DEMO_PROFILE.display_name);
        setStreak(DEMO_STREAK);
        setTotalPoints(190);
        setTotalWorkouts(23);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, streakRes, pointsRes, workoutsRes] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("streaks").select("*").eq("user_id", user.id).single(),
          supabase.from("points").select("points").eq("user_id", user.id),
          supabase
            .from("workouts")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)
            .eq("completed", true),
        ]);

      setProfile(profileRes.data);
      setDisplayName(profileRes.data?.display_name || "");
      setStreak(streakRes.data);
      setTotalPoints(
        (pointsRes.data || []).reduce(
          (sum: number, p: { points: number }) => sum + p.points,
          0
        )
      );
      setTotalWorkouts(workoutsRes.count || 0);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!displayName.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", user.id);

    setSaving(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <User className="h-8 w-8 animate-pulse text-orange-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-white">Profile</h1>

      {/* Avatar + Name */}
      <Card className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-2xl font-bold text-orange-500">
          {profile?.display_name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-white">
            {profile?.display_name}
          </p>
          <StreakBadge streak={streak?.current_streak || 0} />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center p-3">
          <Dumbbell className="h-5 w-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{totalWorkouts}</p>
          <p className="text-[10px] text-slate-500">Workouts</p>
        </Card>
        <Card className="text-center p-3">
          <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">
            {streak?.longest_streak || 0}
          </p>
          <p className="text-[10px] text-slate-500">Best Streak</p>
        </Card>
        <Card className="text-center p-3">
          <Trophy className="h-5 w-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{totalPoints}</p>
          <p className="text-[10px] text-slate-500">Points</p>
        </Card>
      </div>

      {/* Edit Name */}
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">Display Name</h2>
        <div className="flex gap-2">
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="flex-1"
          />
          <Button onClick={handleSave} loading={saving} size="md">
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Sign out */}
      <Button
        variant="danger"
        className="w-full"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
