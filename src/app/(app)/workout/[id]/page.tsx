"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { POINTS, getPointsReason } from "@/lib/points";
import {
  Dumbbell,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Trophy,
  Sparkles,
  Cpu,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Flame,
  Snowflake,
  Target,
} from "lucide-react";
import type { Workout, Exercise, Difficulty, Enjoyment } from "@/lib/types";

interface WorkoutExercise extends Exercise {
  phase: "warmup" | "main" | "cooldown";
}

type Screen = "workout" | "rating";

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set()
  );
  const [completing, setCompleting] = useState(false);
  const [screen, setScreen] = useState<Screen>("workout");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [enjoyment, setEnjoyment] = useState<Enjoyment | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

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

      const longestStreak = Math.max(newStreak, currentStreak.longest_streak);

      await supabase
        .from("streaks")
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_workout_date: today,
        })
        .eq("user_id", user.id);

      if (newStreak > 1) {
        await supabase.from("points").insert({
          user_id: user.id,
          points: POINTS.STREAK_BONUS,
          reason: getPointsReason("STREAK_BONUS"),
        });
      }
    }

    setCompleting(false);
    setWorkout({ ...workout, completed: true });
    setScreen("rating");
  }

  async function submitFeedback() {
    if (!workout || !difficulty || !enjoyment) return;
    setSubmittingFeedback(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Save feedback
    await supabase.from("workout_feedback").insert({
      workout_id: workout.id,
      user_id: user.id,
      difficulty,
      enjoyment,
    });

    // If user hated it, block all main exercises from this workout
    if (enjoyment === "hated") {
      const rawExercises = workout.exercises as unknown as Record<
        string,
        unknown
      >[];
      const mainExercises = rawExercises.filter(
        (e) =>
          e &&
          typeof e === "object" &&
          !("_meta" in e) &&
          e.phase === "main"
      );

      const blocks = mainExercises
        .map((e) => ({
          user_id: user.id,
          exercise_name: String(e.name),
        }))
        .filter((b) => b.exercise_name);

      if (blocks.length > 0) {
        // Use upsert to avoid duplicates
        await supabase
          .from("blocked_exercises")
          .upsert(blocks, { onConflict: "user_id,exercise_name" });
      }
    }

    setSubmittingFeedback(false);
    router.push("/dashboard");
  }

  if (!workout) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Dumbbell className="h-8 w-8 animate-pulse text-orange-500" />
      </div>
    );
  }

  const rawExercises = workout.exercises as unknown as Record<
    string,
    unknown
  >[];
  const metaEntry = rawExercises.find(
    (e) => e && typeof e === "object" && "_meta" in e
  );
  const meta = metaEntry as { _meta: { source: string; trainerNote?: string } } | undefined;
  const aiSource = meta?._meta?.source || "local";
  const trainerNote = meta?._meta?.trainerNote || null;
  const exercises = rawExercises.filter(
    (e) => e && typeof e === "object" && !("_meta" in e)
  ) as unknown as WorkoutExercise[];
  const allCompleted = completedExercises.size === exercises.length;
  const phases = ["warmup", "main", "cooldown"] as const;
  const phaseLabels = {
    warmup: "Warm-up",
    main: "Workout",
    cooldown: "Cool-down",
  };

  // Rating screen
  if (screen === "rating") {
    return (
      <div className="mx-auto max-w-md px-4 py-6 space-y-8">
        <div className="text-center space-y-2 pt-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Trophy className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Workout Complete!</h1>
          <p className="text-sm text-slate-400">+10 points earned</p>
        </div>

        {/* Difficulty */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 text-center">
            How was the difficulty?
          </h2>
          <div className="flex gap-2">
            {(
              [
                {
                  value: "easy" as Difficulty,
                  label: "Easy",
                  icon: Snowflake,
                  color: "blue",
                },
                {
                  value: "just_right" as Difficulty,
                  label: "Just Right",
                  icon: Target,
                  color: "green",
                },
                {
                  value: "hard" as Difficulty,
                  label: "Hard",
                  icon: Flame,
                  color: "red",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 transition-all",
                  difficulty === opt.value
                    ? opt.color === "blue"
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : opt.color === "green"
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : "border-red-500 bg-red-500/10 text-red-400"
                    : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                )}
              >
                <opt.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Enjoyment */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 text-center">
            Did you enjoy it?
          </h2>
          <div className="flex gap-2">
            {(
              [
                {
                  value: "liked" as Enjoyment,
                  label: "Liked It",
                  icon: ThumbsUp,
                  color: "green",
                },
                {
                  value: "ok" as Enjoyment,
                  label: "Just OK",
                  icon: Meh,
                  color: "yellow",
                },
                {
                  value: "hated" as Enjoyment,
                  label: "Hated It",
                  icon: ThumbsDown,
                  color: "red",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEnjoyment(opt.value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 transition-all",
                  enjoyment === opt.value
                    ? opt.color === "green"
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : opt.color === "yellow"
                      ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                      : "border-red-500 bg-red-500/10 text-red-400"
                    : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                )}
              >
                <opt.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
          {enjoyment === "hated" && (
            <p className="text-xs text-red-400 text-center">
              These exercises will be removed from your future workouts
            </p>
          )}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={submitFeedback}
          loading={submittingFeedback}
          disabled={!difficulty || !enjoyment}
        >
          Submit & Continue
        </Button>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full text-center text-xs text-slate-600 hover:text-slate-400"
        >
          Skip feedback
        </button>
      </div>
    );
  }

  // Workout screen
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
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  area === "custom"
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-orange-500/10 text-orange-400"
                }`}
              >
                {area === "custom" ? "Custom Training" : area.replace("_", " ")}
              </span>
            ))}
          </div>
          {trainerNote && (
            <p className="text-xs text-slate-500 italic mb-1">
              &ldquo;{trainerNote}&rdquo;
            </p>
          )}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium mb-1 ${
              aiSource === "ai"
                ? "bg-purple-500/10 text-purple-400"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            {aiSource === "ai" ? (
              <>
                <Sparkles className="h-3 w-3" /> AI Generated
              </>
            ) : (
              <>
                <Cpu className="h-3 w-3" /> Preset Workout
              </>
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
            {phaseExercises.map((exercise) => {
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
