import type { Limitation } from "@/lib/types";

/**
 * Maps each physical limitation to exercise names that are unsafe.
 * These exercises will be hard-blocked from workouts for users with
 * the corresponding limitation — they will never appear in AI-generated
 * or fallback workouts.
 */
export const LIMITATION_BLOCKLIST: Record<Limitation, string[]> = {
  back: [
    "KB Deadlift",
    "KB Swing",
    "KB Rows",
    "Superman Hold",
    "Reverse Snow Angels",
    "KB Windmill",
    "KB Turkish Get-up",
    "Decline Push-ups",
    "KB Renegade Row",
    "Kettlebell Swing",
    "Kettlebell Deadlift",
    "Kettlebell Row",
    "Kettlebell Renegade Row",
    "Renegade Rows",
    "Good Mornings",
    "Bent Over Row",
  ],
  knees: [
    "KB Goblet Squat",
    "Jump Squats",
    "KB Lunges",
    "Wall Sit",
    "KB Step-ups",
    "Calf Raises",
    "Mountain Climbers",
    "High Knees",
    "Bodyweight Squats",
    "Donkey Kicks",
    "Fire Hydrants",
    "KB Sumo Squat",
    "Goblet Squat",
    "Lunges",
    "Step-ups",
    "Squat",
    "Box Jumps",
    "Burpees",
    "Pistol Squat",
    "Bulgarian Split Squat",
  ],
  shoulders: [
    "KB Overhead Press",
    "Pike Push-ups",
    "KB Halo",
    "KB Lateral Raise",
    "KB Windmill",
    "KB Turkish Get-up",
    "Wide Push-ups",
    "Decline Push-ups",
    "Reverse Snow Angels",
    "Arm Circles",
    "Overhead Press",
    "Shoulder Press",
    "Arnold Press",
    "Lateral Raise",
    "Front Raise",
    "Upright Row",
    "KB Snatch",
    "Kettlebell Snatch",
    "KB Clean and Press",
  ],
  wrists: [
    "Push-ups",
    "Diamond Push-ups",
    "Wide Push-ups",
    "Decline Push-ups",
    "Close-grip Push-ups",
    "Pike Push-ups",
    "Plank",
    "Mountain Climbers",
    "Tricep Dips",
    "Burpees",
    "Handstand",
    "Bear Crawl",
  ],
  hips: [
    "KB Goblet Squat",
    "Jump Squats",
    "KB Lunges",
    "KB Step-ups",
    "Glute Bridges",
    "KB Hip Thrust",
    "Donkey Kicks",
    "Fire Hydrants",
    "KB Sumo Squat",
    "KB Swing",
    "High Knees",
    "Bodyweight Squats",
    "Mountain Climbers",
    "Jumping Jacks",
    "Calf Raises",
    "Lunges",
    "Hip Thrust",
    "Kettlebell Swing",
    "Squat",
    "Burpees",
    "Box Jumps",
  ],
  neck: [
    "Decline Push-ups",
    "Superman Hold",
    "Reverse Snow Angels",
    "KB Windmill",
    "KB Turkish Get-up",
    "Bicycle Crunches",
    "Crunches",
    "Sit-ups",
    "Neck Curl",
  ],
  ankles: [
    "Jump Squats",
    "KB Step-ups",
    "Calf Raises",
    "High Knees",
    "Jumping Jacks",
    "Bodyweight Squats",
    "Box Jumps",
    "Burpees",
    "Jump Rope",
    "Skipping",
  ],
};

/**
 * Returns a deduplicated list of all exercise names that are unsafe
 * for a user with the given limitations.
 */
export function getBlockedExerciseNames(limitations: Limitation[]): string[] {
  const blocked = new Set<string>();
  for (const limitation of limitations) {
    const exercises = LIMITATION_BLOCKLIST[limitation];
    if (exercises) {
      for (const name of exercises) {
        blocked.add(name.toLowerCase());
      }
    }
  }
  return Array.from(blocked);
}

/**
 * Checks if a specific exercise name is blocked for the given limitations.
 * Uses case-insensitive partial matching to catch AI-generated variations.
 */
export function isExerciseBlocked(
  exerciseName: string,
  blockedNames: string[]
): boolean {
  const normalized = exerciseName.toLowerCase().trim();
  return blockedNames.some(
    (blocked) =>
      normalized === blocked ||
      normalized.includes(blocked) ||
      blocked.includes(normalized)
  );
}
