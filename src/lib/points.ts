export const POINTS = {
  WORKOUT_COMPLETED: 10,
  STREAK_BONUS: 5,
  WEEKLY_WEIGH_IN: 5,
  LONGEST_WORKOUT_OF_WEEK: 15,
} as const;

export function getPointsReason(key: keyof typeof POINTS): string {
  const reasons: Record<keyof typeof POINTS, string> = {
    WORKOUT_COMPLETED: "Completed a workout",
    STREAK_BONUS: "Streak bonus",
    WEEKLY_WEIGH_IN: "Weekly weigh-in",
    LONGEST_WORKOUT_OF_WEEK: "Longest workout of the week",
  };
  return reasons[key];
}
