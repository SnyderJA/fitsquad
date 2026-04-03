"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { WorkoutCard } from "@/components/workout-card";
import { Dumbbell, ArrowLeft } from "lucide-react";
import type { Workout } from "@/lib/types";

export default function WorkoutHistoryPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(50);

      setWorkouts(data || []);
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

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <h1 className="text-xl font-bold text-white">Workout History</h1>

      {workouts.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No workouts yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {workouts.map((w) => (
            <Link key={w.id} href={`/workout/${w.id}`}>
              <WorkoutCard workout={w} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
