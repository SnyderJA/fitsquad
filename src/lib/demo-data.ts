import type {
  Profile,
  Workout,
  Streak,
  WeighIn,
  LeaderboardEntry,
  FocusArea,
} from "@/lib/types";

export const DEMO_MODE =
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co";

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000)
  .toISOString()
  .split("T")[0];

export const DEMO_PROFILE: Profile = {
  id: "demo-user",
  display_name: "You",
  avatar_url: null,
  gender: null,
  limitations: [],
  pushup_count: null,
  kettlebell_weights: [],
  reminder_enabled: false,
  reminder_days: [],
  reminder_hour: 7,
  created_at: "2025-01-01",
};

export const DEMO_STREAK: Streak = {
  id: "s1",
  user_id: "demo-user",
  current_streak: 5,
  longest_streak: 12,
  last_workout_date: today,
};

export const DEMO_TODAY_WORKOUT: Workout = {
  id: "w1",
  user_id: "demo-user",
  date: today,
  focus_areas: ["chest", "arms"] as FocusArea[],
  duration_minutes: 35,
  exercises: [
    { name: "Jumping Jacks", type: "bodyweight", muscleGroups: ["full_body"], sets: 1, reps: "30s", restSeconds: 0, description: "Full body warm-up", phase: "warmup" },
    { name: "Arm Circles", type: "bodyweight", muscleGroups: ["shoulders"], sets: 1, reps: "20 each", restSeconds: 0, description: "Forward and backward", phase: "warmup" },
    { name: "Push-ups", type: "bodyweight", muscleGroups: ["chest", "arms"], sets: 3, reps: "15", restSeconds: 45, description: "Standard push-ups", phase: "main" },
    { name: "Diamond Push-ups", type: "bodyweight", muscleGroups: ["chest", "arms"], sets: 3, reps: "12", restSeconds: 45, description: "Hands together in diamond shape", phase: "main" },
    { name: "KB Floor Press", type: "kettlebell", muscleGroups: ["chest", "arms"], sets: 3, reps: "12", restSeconds: 60, description: "Press kettlebells from floor", phase: "main" },
    { name: "KB Curl", type: "kettlebell", muscleGroups: ["arms"], sets: 3, reps: "12", restSeconds: 45, description: "Bicep curl with kettlebell", phase: "main" },
    { name: "Tricep Dips", type: "bodyweight", muscleGroups: ["arms", "chest"], sets: 3, reps: "15", restSeconds: 45, description: "Dips using a chair or bench", phase: "main" },
    { name: "KB Tricep Extension", type: "kettlebell", muscleGroups: ["arms"], sets: 3, reps: "12", restSeconds: 45, description: "Overhead tricep extension", phase: "main" },
    { name: "Forward Fold", type: "bodyweight", muscleGroups: ["back", "legs"], sets: 1, reps: "30s", restSeconds: 0, description: "Reach for toes", phase: "cooldown" },
    { name: "Deep Breathing", type: "bodyweight", muscleGroups: ["full_body"], sets: 1, reps: "60s", restSeconds: 0, description: "Slow diaphragmatic breathing", phase: "cooldown" },
  ] as unknown as Workout["exercises"],
  completed: false,
  created_at: today,
};

export const DEMO_WEEK_WORKOUTS: Workout[] = [
  DEMO_TODAY_WORKOUT,
  {
    id: "w2",
    user_id: "demo-user",
    date: yesterday,
    focus_areas: ["legs", "glutes"] as FocusArea[],
    duration_minutes: 40,
    exercises: [],
    completed: true,
    created_at: yesterday,
  },
  {
    id: "w3",
    user_id: "demo-user",
    date: twoDaysAgo,
    focus_areas: ["back", "core"] as FocusArea[],
    duration_minutes: 35,
    exercises: [],
    completed: true,
    created_at: twoDaysAgo,
  },
];

export const DEMO_FRIENDS: {
  profile: Profile;
  todayWorkout: Workout | null;
  streak: Streak | null;
}[] = [
  {
    profile: {
      id: "friend-1",
      display_name: "Marcus",
      avatar_url: null,
      gender: null,
      limitations: [],
      pushup_count: null,
      kettlebell_weights: [],
      reminder_enabled: false,
      reminder_days: [],
      reminder_hour: 7,
      created_at: "2025-01-01",
    },
    todayWorkout: {
      id: "fw1",
      user_id: "friend-1",
      date: today,
      focus_areas: ["legs", "glutes"] as FocusArea[],
      duration_minutes: 40,
      exercises: [],
      completed: true,
      created_at: today,
    },
    streak: {
      id: "fs1",
      user_id: "friend-1",
      current_streak: 8,
      longest_streak: 15,
      last_workout_date: today,
    },
  },
  {
    profile: {
      id: "friend-2",
      display_name: "Aisha",
      avatar_url: null,
      gender: null,
      limitations: [],
      pushup_count: null,
      kettlebell_weights: [],
      reminder_enabled: false,
      reminder_days: [],
      reminder_hour: 7,
      created_at: "2025-01-01",
    },
    todayWorkout: null,
    streak: {
      id: "fs2",
      user_id: "friend-2",
      current_streak: 3,
      longest_streak: 20,
      last_workout_date: yesterday,
    },
  },
  {
    profile: {
      id: "friend-3",
      display_name: "Jordan",
      avatar_url: null,
      gender: null,
      limitations: [],
      pushup_count: null,
      kettlebell_weights: [],
      reminder_enabled: false,
      reminder_days: [],
      reminder_hour: 7,
      created_at: "2025-01-01",
    },
    todayWorkout: {
      id: "fw3",
      user_id: "friend-3",
      date: today,
      focus_areas: ["full_body"] as FocusArea[],
      duration_minutes: 30,
      exercises: [],
      completed: false,
      created_at: today,
    },
    streak: {
      id: "fs3",
      user_id: "friend-3",
      current_streak: 1,
      longest_streak: 7,
      last_workout_date: today,
    },
  },
];

export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  {
    user_id: "friend-1",
    display_name: "Marcus",
    avatar_url: null,
    total_points: 245,
    current_streak: 8,
  },
  {
    user_id: "demo-user",
    display_name: "You",
    avatar_url: null,
    total_points: 190,
    current_streak: 5,
  },
  {
    user_id: "friend-2",
    display_name: "Aisha",
    avatar_url: null,
    total_points: 175,
    current_streak: 3,
  },
  {
    user_id: "friend-3",
    display_name: "Jordan",
    avatar_url: null,
    total_points: 85,
    current_streak: 1,
  },
];

export const DEMO_WEIGH_INS: WeighIn[] = [
  { id: "wi1", user_id: "demo-user", weight: 182.5, date: today, created_at: today },
  { id: "wi2", user_id: "demo-user", weight: 183.0, date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0], created_at: "" },
  { id: "wi3", user_id: "demo-user", weight: 184.2, date: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0], created_at: "" },
  { id: "wi4", user_id: "demo-user", weight: 185.0, date: new Date(Date.now() - 21 * 86400000).toISOString().split("T")[0], created_at: "" },
  { id: "wi5", user_id: "demo-user", weight: 186.3, date: new Date(Date.now() - 28 * 86400000).toISOString().split("T")[0], created_at: "" },
  { id: "wi6", user_id: "demo-user", weight: 185.8, date: new Date(Date.now() - 35 * 86400000).toISOString().split("T")[0], created_at: "" },
];
