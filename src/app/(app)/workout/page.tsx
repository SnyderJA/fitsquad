"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FocusAreaPicker } from "@/components/focus-area-picker";
import { generateWorkout } from "@/lib/ai/generate-workout";
import { Dumbbell, Clock, Sparkles } from "lucide-react";
import type { FocusArea } from "@/lib/types";

export default function NewWorkoutPage() {
  const router = useRouter();
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [duration, setDuration] = useState(35);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (focusAreas.length === 0) return;
    setLoading(true);

    let exercises;

    // Try AI generation first, fall back to local generator
    try {
      const aiResponse = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusAreas, durationMinutes: duration }),
      });

      if (aiResponse.ok) {
        const aiWorkout = await aiResponse.json();
        exercises = [
          ...aiWorkout.warmup,
          ...aiWorkout.exercises,
          ...aiWorkout.cooldown,
        ];
      } else {
        throw new Error("AI unavailable");
      }
    } catch {
      // Fallback to local generator
      const workout = generateWorkout(focusAreas, duration);
      exercises = [
        ...workout.warmup.map((e) => ({ ...e, phase: "warmup" })),
        ...workout.exercises.map((e) => ({ ...e, phase: "main" })),
        ...workout.cooldown.map((e) => ({ ...e, phase: "cooldown" })),
      ];
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split("T")[0],
        focus_areas: focusAreas,
        duration_minutes: duration,
        exercises,
        completed: false,
      })
      .select()
      .single();

    setLoading(false);

    if (data && !error) {
      router.push(`/workout/${data.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">New Workout</h1>
        <p className="text-sm text-slate-400 mt-1">
          Pick your focus areas and we&apos;ll build your workout
        </p>
      </div>

      {/* Focus Areas */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">Focus Areas</h2>
        <FocusAreaPicker selected={focusAreas} onChange={setFocusAreas} />
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Duration
        </h2>
        <div className="flex gap-2">
          {[30, 35, 40, 45].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                duration === d
                  ? "border-orange-500 bg-orange-500/10 text-orange-400"
                  : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Equipment note */}
      <div className="rounded-xl bg-slate-800/30 border border-slate-700/30 p-3 flex items-start gap-2">
        <Dumbbell className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-500">
          Workouts include bodyweight exercises and kettlebell movements. No gym
          required!
        </p>
      </div>

      {/* Generate */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleGenerate}
        loading={loading}
        disabled={focusAreas.length === 0}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Generate Workout
      </Button>
    </div>
  );
}
