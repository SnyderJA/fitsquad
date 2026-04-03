import { Card } from "@/components/ui/card";
import { StreakBadge } from "@/components/streak-badge";
import { Dumbbell } from "lucide-react";
import type { Profile, Workout, Streak } from "@/lib/types";

interface FriendSummaryProps {
  profile: Profile;
  todayWorkout?: Workout | null;
  streak?: Streak | null;
}

export function FriendSummary({
  profile,
  todayWorkout,
  streak,
}: FriendSummaryProps) {
  return (
    <Card className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
        {profile.display_name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {profile.display_name}
        </p>
        {todayWorkout ? (
          <p className="text-xs text-green-400 flex items-center gap-1">
            <Dumbbell className="h-3 w-3" />
            {todayWorkout.completed ? "Completed" : "In progress"} &middot;{" "}
            {todayWorkout.focus_areas.map((a) => a.replace("_", " ")).join(", ")}
          </p>
        ) : (
          <p className="text-xs text-slate-500">No workout today</p>
        )}
      </div>
      {streak && <StreakBadge streak={streak.current_streak} size="sm" />}
    </Card>
  );
}
