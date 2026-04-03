"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkoutCard } from "@/components/workout-card";
import { StreakBadge } from "@/components/streak-badge";
import { FriendSummary } from "@/components/friend-summary";
import { Leaderboard } from "@/components/leaderboard";
import { getGreeting } from "@/lib/utils";
import { Dumbbell, Plus, TrendingUp, Trophy } from "lucide-react";
import {
  DEMO_MODE,
  DEMO_PROFILE,
  DEMO_STREAK,
  DEMO_TODAY_WORKOUT,
  DEMO_WEEK_WORKOUTS,
  DEMO_FRIENDS,
  DEMO_LEADERBOARD,
} from "@/lib/demo-data";
import type {
  Profile,
  Workout,
  Streak,
  LeaderboardEntry,
} from "@/lib/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [weekWorkouts, setWeekWorkouts] = useState<Workout[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [friends, setFriends] = useState<
    { profile: Profile; todayWorkout: Workout | null; streak: Streak | null }[]
  >([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (DEMO_MODE) {
        setProfile(DEMO_PROFILE);
        setTodayWorkout(DEMO_TODAY_WORKOUT);
        setWeekWorkouts(DEMO_WEEK_WORKOUTS);
        setStreak(DEMO_STREAK);
        setTotalPoints(190);
        setFriends(DEMO_FRIENDS);
        setLeaderboard(DEMO_LEADERBOARD);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000)
        .toISOString()
        .split("T")[0];

      const [profileRes, todayRes, weekRes, streakRes, pointsRes] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase
            .from("workouts")
            .select("*")
            .eq("user_id", user.id)
            .eq("date", today)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("workouts")
            .select("*")
            .eq("user_id", user.id)
            .gte("date", weekAgo)
            .order("date", { ascending: false }),
          supabase
            .from("streaks")
            .select("*")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("points")
            .select("points")
            .eq("user_id", user.id),
        ]);

      setProfile(profileRes.data);
      setTodayWorkout(todayRes.data);
      setWeekWorkouts(weekRes.data || []);
      setStreak(streakRes.data);
      setTotalPoints(
        (pointsRes.data || []).reduce(
          (sum: number, p: { points: number }) => sum + p.points,
          0
        )
      );

      // Load friends from groups
      const { data: myGroups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (myGroups && myGroups.length > 0) {
        const groupIds = myGroups.map((g) => g.group_id);
        const { data: members } = await supabase
          .from("group_members")
          .select("user_id, profiles(*)")
          .in("group_id", groupIds)
          .neq("user_id", user.id);

        if (members) {
          const uniqueFriends = new Map<string, Profile>();
          members.forEach((m) => {
            const p = m.profiles as unknown as Profile;
            if (p && !uniqueFriends.has(m.user_id)) {
              uniqueFriends.set(m.user_id, p);
            }
          });

          const friendData = await Promise.all(
            Array.from(uniqueFriends.entries()).map(
              async ([userId, friendProfile]) => {
                const [wRes, sRes] = await Promise.all([
                  supabase
                    .from("workouts")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("date", today)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                  supabase
                    .from("streaks")
                    .select("*")
                    .eq("user_id", userId)
                    .single(),
                ]);
                return {
                  profile: friendProfile,
                  todayWorkout: wRes.data,
                  streak: sRes.data,
                };
              }
            )
          );
          setFriends(friendData);

          // Build leaderboard
          const allUserIds = [
            user.id,
            ...Array.from(uniqueFriends.keys()),
          ];
          const { data: lbData } = await supabase
            .from("leaderboard")
            .select("*")
            .in("user_id", allUserIds)
            .order("total_points", { ascending: false });

          setLeaderboard(lbData || []);
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Dumbbell className="h-8 w-8 animate-pulse text-orange-500" />
      </div>
    );
  }

  const completedThisWeek = weekWorkouts.filter((w) => w.completed).length;

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{getGreeting()}</p>
          <h1 className="text-xl font-bold text-white">
            {profile?.display_name || "Athlete"}
          </h1>
        </div>
        <StreakBadge streak={streak?.current_streak || 0} size="lg" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center p-3">
          <p className="text-2xl font-bold text-orange-400">
            {completedThisWeek}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">This Week</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-2xl font-bold text-orange-400">
            {streak?.longest_streak || 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Best Streak</p>
        </Card>
        <Card className="text-center p-3">
          <div className="flex items-center justify-center gap-1">
            <Trophy className="h-4 w-4 text-orange-400" />
            <p className="text-2xl font-bold text-orange-400">{totalPoints}</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Points</p>
        </Card>
      </div>

      {/* Today's Workout */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-300">Today</h2>
        {todayWorkout ? (
          <Link href={`/workout/${todayWorkout.id}`}>
            <WorkoutCard workout={todayWorkout} showDate={false} />
          </Link>
        ) : (
          <Card className="flex flex-col items-center gap-3 py-6">
            <Dumbbell className="h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-500">No workout yet today</p>
            <Link href="/workout">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Start Workout
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* This Week */}
      {weekWorkouts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              This Week
            </h2>
            <Link
              href="/workout/history"
              className="text-xs text-orange-500 hover:text-orange-400"
            >
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {weekWorkouts.slice(0, 3).map((w) => (
              <Link key={w.id} href={`/workout/${w.id}`}>
                <WorkoutCard workout={w} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Friends Activity */}
      {friends.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-300">
            Squad Activity
          </h2>
          <div className="space-y-2">
            {friends.map((f) => (
              <FriendSummary
                key={f.profile.id}
                profile={f.profile}
                todayWorkout={f.todayWorkout}
                streak={f.streak}
              />
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Leaderboard
          entries={leaderboard}
          currentUserId={profile?.id}
        />
      )}

      {/* Empty state for no group */}
      {friends.length === 0 && (
        <Card className="text-center py-6 space-y-3">
          <p className="text-sm text-slate-500">
            Join a squad to see friends&apos; activity and compete!
          </p>
          <Link href="/group">
            <Button variant="secondary" size="sm">
              Join or Create Squad
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
