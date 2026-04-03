export type FocusArea =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "glutes"
  | "core"
  | "full_body";

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

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  gender: Gender | null;
  limitations: Limitation[];
  pushup_count: number | null;
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
