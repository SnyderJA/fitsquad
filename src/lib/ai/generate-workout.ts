import type { FocusArea, Exercise, GeneratedWorkout, Limitation } from "@/lib/types";
import { getBlockedExerciseNames, isExerciseBlocked } from "@/lib/ai/exercise-blocklist";

const EXERCISE_LIBRARY: Exercise[] = [
  // Chest
  { name: "Push-ups", type: "bodyweight", muscleGroups: ["chest", "arms"], sets: 3, reps: "15", restSeconds: 45, description: "Standard push-ups" },
  { name: "Diamond Push-ups", type: "bodyweight", muscleGroups: ["chest", "arms"], sets: 3, reps: "12", restSeconds: 45, description: "Hands together in diamond shape" },
  { name: "Wide Push-ups", type: "bodyweight", muscleGroups: ["chest", "shoulders"], sets: 3, reps: "15", restSeconds: 45, description: "Hands wider than shoulder width" },
  { name: "Decline Push-ups", type: "bodyweight", muscleGroups: ["chest", "shoulders"], sets: 3, reps: "12", restSeconds: 60, description: "Feet elevated on a surface" },
  { name: "KB Floor Press", type: "kettlebell", muscleGroups: ["chest", "arms"], sets: 3, reps: "12", restSeconds: 60, description: "Press kettlebells from floor" },
  { name: "KB Chest Fly", type: "kettlebell", muscleGroups: ["chest"], sets: 3, reps: "12", restSeconds: 60, description: "Fly motion with kettlebells on floor" },

  // Back
  { name: "KB Rows", type: "kettlebell", muscleGroups: ["back", "arms"], sets: 3, reps: "12 each", restSeconds: 60, description: "Single arm row" },
  { name: "KB Deadlift", type: "kettlebell", muscleGroups: ["back", "legs"], sets: 3, reps: "12", restSeconds: 60, description: "Romanian deadlift with kettlebell" },
  { name: "Superman Hold", type: "bodyweight", muscleGroups: ["back"], sets: 3, reps: "30s", restSeconds: 45, description: "Lie face down, lift arms and legs" },
  { name: "KB Swing", type: "kettlebell", muscleGroups: ["back", "glutes"], sets: 4, reps: "15", restSeconds: 60, description: "Hip-hinge swing motion" },
  { name: "Reverse Snow Angels", type: "bodyweight", muscleGroups: ["back", "shoulders"], sets: 3, reps: "12", restSeconds: 45, description: "Lie face down, move arms in arc" },

  // Shoulders
  { name: "KB Overhead Press", type: "kettlebell", muscleGroups: ["shoulders", "arms"], sets: 3, reps: "10 each", restSeconds: 60, description: "Single arm press overhead" },
  { name: "Pike Push-ups", type: "bodyweight", muscleGroups: ["shoulders", "arms"], sets: 3, reps: "10", restSeconds: 60, description: "Push-up in pike position" },
  { name: "KB Halo", type: "kettlebell", muscleGroups: ["shoulders", "core"], sets: 3, reps: "10 each", restSeconds: 45, description: "Circle kettlebell around head" },
  { name: "KB Lateral Raise", type: "kettlebell", muscleGroups: ["shoulders"], sets: 3, reps: "12", restSeconds: 45, description: "Raise kettlebell to side" },

  // Arms
  { name: "KB Curl", type: "kettlebell", muscleGroups: ["arms"], sets: 3, reps: "12", restSeconds: 45, description: "Bicep curl with kettlebell" },
  { name: "Tricep Dips", type: "bodyweight", muscleGroups: ["arms", "chest"], sets: 3, reps: "15", restSeconds: 45, description: "Dips using a chair or bench" },
  { name: "KB Tricep Extension", type: "kettlebell", muscleGroups: ["arms"], sets: 3, reps: "12", restSeconds: 45, description: "Overhead tricep extension" },
  { name: "Close-grip Push-ups", type: "bodyweight", muscleGroups: ["arms", "chest"], sets: 3, reps: "12", restSeconds: 45, description: "Hands close together" },

  // Legs
  { name: "KB Goblet Squat", type: "kettlebell", muscleGroups: ["legs", "glutes"], sets: 4, reps: "12", restSeconds: 60, description: "Hold KB at chest, squat deep" },
  { name: "Jump Squats", type: "bodyweight", muscleGroups: ["legs", "glutes"], sets: 3, reps: "15", restSeconds: 60, description: "Explosive squat jumps" },
  { name: "KB Lunges", type: "kettlebell", muscleGroups: ["legs", "glutes"], sets: 3, reps: "10 each", restSeconds: 60, description: "Forward lunges holding KB" },
  { name: "Wall Sit", type: "bodyweight", muscleGroups: ["legs"], sets: 3, reps: "45s", restSeconds: 45, description: "Hold squat against wall" },
  { name: "KB Step-ups", type: "kettlebell", muscleGroups: ["legs", "glutes"], sets: 3, reps: "10 each", restSeconds: 60, description: "Step onto elevated surface" },
  { name: "Calf Raises", type: "bodyweight", muscleGroups: ["legs"], sets: 3, reps: "20", restSeconds: 30, description: "Rise onto toes" },

  // Glutes
  { name: "Glute Bridges", type: "bodyweight", muscleGroups: ["glutes", "legs"], sets: 3, reps: "15", restSeconds: 45, description: "Hip bridge from floor" },
  { name: "KB Hip Thrust", type: "kettlebell", muscleGroups: ["glutes"], sets: 3, reps: "12", restSeconds: 60, description: "Weighted hip thrust" },
  { name: "Donkey Kicks", type: "bodyweight", muscleGroups: ["glutes"], sets: 3, reps: "15 each", restSeconds: 45, description: "On all fours, kick leg back" },
  { name: "Fire Hydrants", type: "bodyweight", muscleGroups: ["glutes"], sets: 3, reps: "15 each", restSeconds: 45, description: "On all fours, lift leg to side" },
  { name: "KB Sumo Squat", type: "kettlebell", muscleGroups: ["glutes", "legs"], sets: 3, reps: "12", restSeconds: 60, description: "Wide stance squat with KB" },

  // Core
  { name: "Plank", type: "bodyweight", muscleGroups: ["core"], sets: 3, reps: "45s", restSeconds: 45, description: "Hold plank position" },
  { name: "KB Russian Twist", type: "kettlebell", muscleGroups: ["core"], sets: 3, reps: "20", restSeconds: 45, description: "Seated twist with KB" },
  { name: "Mountain Climbers", type: "bodyweight", muscleGroups: ["core", "legs"], sets: 3, reps: "30s", restSeconds: 45, description: "Alternating knee drives in plank" },
  { name: "Bicycle Crunches", type: "bodyweight", muscleGroups: ["core"], sets: 3, reps: "20", restSeconds: 45, description: "Alternating elbow to knee" },
  { name: "KB Windmill", type: "kettlebell", muscleGroups: ["core", "shoulders"], sets: 3, reps: "8 each", restSeconds: 60, description: "KB overhead, bend to touch floor" },
  { name: "Dead Bug", type: "bodyweight", muscleGroups: ["core"], sets: 3, reps: "12 each", restSeconds: 45, description: "Alternating arm and leg extensions" },
  { name: "KB Turkish Get-up", type: "kettlebell", muscleGroups: ["core", "shoulders"], sets: 2, reps: "3 each", restSeconds: 90, description: "Full get-up from floor to standing" },
];

const WARMUP: Exercise[] = [
  { name: "Jumping Jacks", type: "bodyweight", muscleGroups: ["full_body"], sets: 1, reps: "30s", restSeconds: 0, description: "Full body warm-up" },
  { name: "Arm Circles", type: "bodyweight", muscleGroups: ["shoulders"], sets: 1, reps: "20 each", restSeconds: 0, description: "Forward and backward" },
  { name: "High Knees", type: "bodyweight", muscleGroups: ["legs", "core"], sets: 1, reps: "30s", restSeconds: 0, description: "Drive knees up" },
  { name: "Bodyweight Squats", type: "bodyweight", muscleGroups: ["legs", "glutes"], sets: 1, reps: "10", restSeconds: 0, description: "Slow, controlled squats" },
];

const COOLDOWN: Exercise[] = [
  { name: "Forward Fold", type: "bodyweight", muscleGroups: ["back", "legs"], sets: 1, reps: "30s", restSeconds: 0, description: "Reach for toes" },
  { name: "Child's Pose", type: "bodyweight", muscleGroups: ["back"], sets: 1, reps: "30s", restSeconds: 0, description: "Kneeling stretch" },
  { name: "Quad Stretch", type: "bodyweight", muscleGroups: ["legs"], sets: 1, reps: "30s each", restSeconds: 0, description: "Standing quad stretch" },
  { name: "Deep Breathing", type: "bodyweight", muscleGroups: ["full_body"], sets: 1, reps: "60s", restSeconds: 0, description: "Slow diaphragmatic breathing" },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateWorkout(
  focusAreas: FocusArea[],
  durationMinutes: number = 35,
  limitations: Limitation[] = []
): GeneratedWorkout {
  const areas = focusAreas.includes("full_body")
    ? (["chest", "back", "shoulders", "arms", "legs", "glutes", "core"] as FocusArea[])
    : focusAreas;

  const blockedNames = getBlockedExerciseNames(limitations);

  // Filter kettlebell exercises matching focus areas AND safe for user's limitations
  const matchingExercises = EXERCISE_LIBRARY.filter(
    (ex) =>
      ex.type === "kettlebell" &&
      ex.muscleGroups.some((mg) => areas.includes(mg)) &&
      !isExerciseBlocked(ex.name, blockedNames)
  );

  // Filter warmup and cooldown for safety too
  const safeWarmup = WARMUP.filter(
    (ex) => !isExerciseBlocked(ex.name, blockedNames)
  );
  const safeCooldown = COOLDOWN.filter(
    (ex) => !isExerciseBlocked(ex.name, blockedNames)
  );

  // Shuffle and pick enough exercises to fill the duration
  const mainMinutes = durationMinutes - 10;
  const exerciseCount = Math.max(4, Math.min(8, Math.floor(mainMinutes / 3.5)));

  const selected = shuffleArray(matchingExercises)
    .slice(0, exerciseCount)
    .map((ex) => ({ ...ex, suggestedWeight: "25 lbs" }));

  return {
    focusAreas,
    durationMinutes,
    exercises: selected,
    warmup: safeWarmup.length > 0 ? safeWarmup : [WARMUP[0]], // always have at least one
    cooldown: safeCooldown.length > 0 ? safeCooldown : [COOLDOWN[0]],
  };
}
