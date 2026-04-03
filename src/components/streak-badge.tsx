import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
}

export function StreakBadge({ streak, size = "md" }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-bold",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",
        isActive
          ? "bg-orange-500/10 text-orange-400"
          : "bg-slate-800 text-slate-500"
      )}
    >
      <Flame
        className={cn(
          size === "sm" && "h-3 w-3",
          size === "md" && "h-4 w-4",
          size === "lg" && "h-5 w-5",
          isActive && "fill-orange-400"
        )}
      />
      {streak}
    </div>
  );
}
