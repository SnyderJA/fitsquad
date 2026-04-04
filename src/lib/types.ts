export type FocusArea =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "glutes"
  | "core"
  | "full_body"
  | "custom";

export const FOCUS_AREAS: { value: FocusArea; label: string }[] = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "glutes", label: "Glutes" },
  { value: "core", label: "Core / Stomach" },
  { value: "full_body", label: "Full Body" },
];

export type EquipmentType = "bodyweight" | "kettlebell";

export interface Exercise {
  name: string;
  type: EquipmentType;
  muscleGroups: FocusArea[];
  sets: number;
  reps: string; // e.g. "12" or "30s" for timed
  restSeconds: number;
  description: string;
  suggestedWeight?: string; // e.g. "20 lbs" for kettlebell exercises
}

export interface GeneratedWorkout {
  focusAreas: FocusArea[];
  durationMinutes: number;
  exercises: Exercise[];
  warmup: Exercise[];
  cooldown: Exercise[];
}

export type Gender = "male" | "female" | "other";

export const LIMITATION_OPTIONS = [
  { value: "back", label: "Back" },
  { value: "knees", label: "Knees" },
  { value: "shoulders", label: "Shoulders" },
  { value: "wrists", label: "Wrists" },
  { value: "hips", label: "Hips" },
  { value: "neck", label: "Neck" },
  { value: "ankles", label: "Ankles" },
] as const;

export type Limitation = (typeof LIMITATION_OPTIONS)[number]["value"];

export const KETTLEBELL_WEIGHTS = [
  5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40,
  42.5, 45, 47.5, 50, 52.5, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
] as const;

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  gender: Gender | null;
  limitations: Limitation[];
  pushup_count: number | null;
  kettlebell_weights: number[];
  reminder_enabled: boolean;
  reminder_days: DayOfWeek[];
  reminder_hour: number;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  date: string;
  focus_areas: FocusArea[];
  duration_minutes: number;
  exercises: Exercise[];
  completed: boolean;
  created_at: string;
}

export interface WeighIn {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
  profiles?: Profile;
}

export type Difficulty = "easy" | "just_right" | "hard";
export type Enjoyment = "liked" | "ok" | "hated";

export interface WorkoutFeedback {
  id: string;
  workout_id: string;
  user_id: string;
  difficulty: Difficulty;
  enjoyment: Enjoyment;
  created_at: string;
}

export interface BlockedExercise {
  id: string;
  user_id: string;
  exercise_name: string;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
}

export interface PointEntry {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  current_streak: number;
}
