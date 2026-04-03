"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { POINTS, getPointsReason } from "@/lib/points";
import {
  Dumbbell,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Trophy,
  Sparkles,
  Cpu,
} from "lucide-react";
import type { Workout, Exercise } from "@/lib/types";

interface WorkoutExercise extends Exercise {
  phase: "warmup" | "main" | "cooldown";
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set()
  );
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", params.id)
        .single();
      setWorkout(data);
    }
    load();
  }, [params.id]);

  function toggleExercise(index: number) {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  async function completeWorkout() {
    if (!workout) return;
    setCompleting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Mark workout complete
    await supabase
      .from("workouts")
      .update({ completed: true })
      .eq("id", workout.id);

    // Award points
    await supabase.from("points").insert({
      user_id: user.id,
      points: POINTS.WORKOUT_COMPLETED,
      reason: getPointsReason("WORKOUT_COMPLETED"),
    });

    // Update streak
    const today = new Date().toISOString().split("T")[0];
    const { data: currentStreak } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (currentStreak) {
      const lastDate = currentStreak.last_workout_date;
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      let newStreak = 1;
      if (lastDate === yesterday) {
        newStreak = currentStreak.current_streak + 1;
      } else if (lastDate === today) {
        newStreak = currentStreak.current_streak;
      }

      const longestStreak = Math.max(
        newStreak,
        currentStreak.longest_streak
      );

      await supabase
        .from("streaks")
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_workout_date: today,
        })
        .eq("user_id", user.id);

      // Streak bonus
      if (newStreak > 1) {
        await supabase.from("points").insert({
          user_id: user.id,
          points: POINTS.STREAK_BONUS,
          reason: getPointsReason("STREAK_BONUS"),
        });
      }
    }

    setCompleting(false);
    router.push("/dashboard");
  }

  if (!workout) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Dumbbell className="h-8 w-8 animate-pulse text-orange-500" />
      </div>
    );
  }

  const rawExercises = workout.exercises as unknown as Record<string, unknown>[];
  const metaEntry = rawExercises.find((e) => e && typeof e === "object" && "_meta" in e);
  const meta = metaEntry as { _meta: { source: string } } | undefined;
  const aiSource = meta?._meta?.source || "local";
  const exercises = rawExercises.filter(
    (e) => e && typeof e === "object" && !("_meta" in e)
  ) as unknown as WorkoutExercise[];
  const allCompleted = completedExercises.size === exercises.length;
  const phases = ["warmup", "main", "cooldown"] as const;
  const phaseLabels = { warmup: "Warm-up", main: "Workout", cooldown: "Cool-down" };

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex flex-wrap gap-1.5 mb-1">
            {workout.focus_areas.map((area) => (
              <span
                key={area}
                className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400 capitalize"
              >
                {area.replace("_", " ")}
              </span>
            ))}
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium mb-1 ${
              aiSource === "ai"
                ? "bg-purple-500/10 text-purple-400"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            {aiSource === "ai" ? (
              <><Sparkles className="h-3 w-3" /> AI Generated</>
            ) : (
              <><Cpu className="h-3 w-3" /> Preset Workout</>
            )}
          </span>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5" />
              {exercises.length} exercises
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              ~{workout.duration_minutes} min
            </span>
          </div>
        </div>
        {workout.completed && (
          <span className="flex items-center gap-1 text-sm text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Done
          </span>
        )}
      </div>

      {/* Exercises by phase */}
      {phases.map((phase) => {
        const phaseExercises = exercises.filter((e) => e.phase === phase);
        if (phaseExercises.length === 0) return null;

        return (
          <div key={phase} className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {phaseLabels[phase]}
            </h2>
            {phaseExercises.map((exercise, _phaseIdx) => {
              const globalIdx = exercises.indexOf(exercise);
              const isDone = completedExercises.has(globalIdx);

              return (
                <Card
                  key={globalIdx}
                  className={`cursor-pointer transition-all ${
                    isDone ? "border-green-500/30 bg-green-500/5" : ""
                  }`}
                  onClick={() =>
                    !workout.completed && toggleExercise(globalIdx)
                  }
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isDone
                          ? "border-green-500 bg-green-500"
                          : "border-slate-600"
                      }`}
                    >
                      {isDone && (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isDone ? "text-green-400" : "text-white"
                        }`}
                      >
                        {exercise.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {exercise.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{exercise.sets} sets</span>
                        <span>{exercise.reps} reps</span>
                        {exercise.restSeconds > 0 && (
                          <span>{exercise.restSeconds}s rest</span>
                        )}
                      </div>
                      {exercise.suggestedWeight && (
                        <p className="mt-1 text-xs font-medium text-blue-400">
                          {exercise.suggestedWeight}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        exercise.type === "kettlebell"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {exercise.type === "kettlebell" ? "KB" : "BW"}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        );
      })}

      {/* Complete button */}
      {!workout.completed && (
        <Button
          className="w-full"
          size="lg"
          onClick={completeWorkout}
          loading={completing}
          disabled={!allCompleted}
        >
          <Trophy className="h-4 w-4 mr-2" />
          {allCompleted
            ? "Complete Workout (+10 pts)"
            : `${completedExercises.size}/${exercises.length} exercises done`}
        </Button>
      )}
    </div>
  );
}
