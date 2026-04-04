import { Card } from "@/components/ui/card";
import { Dumbbell, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Workout } from "@/lib/types";

interface WorkoutCardProps {
  workout: Workout;
  showDate?: boolean;
}

export function WorkoutCard({ workout, showDate = true }: WorkoutCardProps) {
  return (
    <Card className={cn(workout.completed && "border-green-500/30")}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {showDate && (
            <p className="text-xs text-slate-500">{formatDate(workout.date)}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
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
        </div>
        {workout.completed && (
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
        )}
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
        <span className="flex items-center gap-1">
          <Dumbbell className="h-3.5 w-3.5" />
          {workout.exercises.length} exercises
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {workout.duration_minutes} min
        </span>
      </div>
    </Card>
  );
}
