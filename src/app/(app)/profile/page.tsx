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
  Check,
} from "lucide-react";
import { DEMO_MODE, DEMO_PROFILE, DEMO_STREAK } from "@/lib/demo-data";
import { LIMITATION_OPTIONS, KETTLEBELL_WEIGHTS, DAYS_OF_WEEK } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Profile, Streak, Gender, Limitation, DayOfWeek } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [limitations, setLimitations] = useState<Limitation[]>([]);
  const [pushupCount, setPushupCount] = useState<string>("");
  const [kettlebellWeights, setKettlebellWeights] = useState<number[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState<DayOfWeek[]>([]);
  const [reminderHour, setReminderHour] = useState(7);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
      setGender(profileRes.data?.gender || null);
      setLimitations(profileRes.data?.limitations || []);
      setPushupCount(
        profileRes.data?.pushup_count != null
          ? String(profileRes.data.pushup_count)
          : ""
      );
      setKettlebellWeights(profileRes.data?.kettlebell_weights || []);
      setReminderEnabled(profileRes.data?.reminder_enabled || false);
      setReminderDays(profileRes.data?.reminder_days || []);
      setReminderHour(profileRes.data?.reminder_hour ?? 7);
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

  function toggleLimitation(lim: Limitation) {
    setLimitations((prev) =>
      prev.includes(lim) ? prev.filter((l) => l !== lim) : [...prev, lim]
    );
  }

  function toggleWeight(weight: number) {
    setKettlebellWeights((prev) =>
      prev.includes(weight)
        ? prev.filter((w) => w !== weight)
        : [...prev, weight].sort((a, b) => a - b)
    );
  }

  function toggleReminderDay(day: DayOfWeek) {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSave() {
    if (!displayName.trim()) return;
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        gender,
        limitations,
        pushup_count: pushupCount ? parseInt(pushupCount, 10) : null,
        kettlebell_weights: kettlebellWeights,
        reminder_enabled: reminderEnabled,
        reminder_days: reminderDays,
        reminder_hour: reminderHour,
      })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
        />
      </Card>

      {/* Gender */}
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">Gender</h2>
        <div className="flex gap-2">
          {(["male", "female", "other"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={cn(
                "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-all",
                gender === g
                  ? "border-orange-500 bg-orange-500/10 text-orange-400"
                  : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </Card>

      {/* Physical Limitations */}
      <Card className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-300">
            Physical Limitations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any areas with injuries or pain so AI avoids exercises that stress them
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LIMITATION_OPTIONS.map((lim) => {
            const isSelected = limitations.includes(lim.value);
            return (
              <button
                key={lim.value}
                onClick={() => toggleLimitation(lim.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  isSelected
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                )}
              >
                {lim.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Pushup Count */}
      <Card className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-300">
            Fitness Level
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            How many push-ups can you do in one set? This helps calibrate workout difficulty.
          </p>
        </div>
        <Input
          id="pushupCount"
          type="number"
          min="0"
          max="200"
          placeholder="e.g. 15"
          value={pushupCount}
          onChange={(e) => setPushupCount(e.target.value)}
        />
      </Card>

      {/* Kettlebell Weights */}
      <Card className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-300">
            My Kettlebells
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select the weights you have so the AI suggests the right one for each exercise
          </p>
        </div>
        <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
          {KETTLEBELL_WEIGHTS.map((weight) => {
            const isSelected = kettlebellWeights.includes(weight);
            return (
              <button
                key={weight}
                onClick={() => toggleWeight(weight)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-xs font-bold transition-all",
                  isSelected
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                )}
              >
                {weight} lbs
              </button>
            );
          })}
        </div>
      </Card>

      {/* Workout Reminders */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-300">
              Workout Reminders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Get an email reminder on your workout days
            </p>
          </div>
          <button
            onClick={() => setReminderEnabled(!reminderEnabled)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              reminderEnabled ? "bg-orange-500" : "bg-slate-700"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                reminderEnabled ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {reminderEnabled && (
          <>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Which days?</p>
              <div className="flex gap-1.5">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = reminderDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      onClick={() => toggleReminderDay(day.value)}
                      className={cn(
                        "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                        isSelected
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500"
                          : "bg-slate-800/50 text-slate-500 border border-slate-700 hover:border-slate-600"
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400">What time?</p>
              <select
                value={reminderHour}
                onChange={(e) => setReminderHour(parseInt(e.target.value))}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {Array.from({ length: 16 }, (_, i) => i + 5).map((hour) => (
                  <option key={hour} value={hour}>
                    {hour === 0
                      ? "12:00 AM"
                      : hour < 12
                      ? `${hour}:00 AM`
                      : hour === 12
                      ? "12:00 PM"
                      : `${hour - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </Card>

      {/* Save */}
      <Button
        className="w-full"
        onClick={handleSave}
        loading={saving}
      >
        {saved ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Saved!
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Profile
          </>
        )}
      </Button>

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
