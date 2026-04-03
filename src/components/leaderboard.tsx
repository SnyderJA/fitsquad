"use client";

import { Card } from "@/components/ui/card";
import { StreakBadge } from "@/components/streak-badge";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const sorted = [...entries].sort((a, b) => b.total_points - a.total_points);

  if (sorted.length === 0) {
    return (
      <Card className="text-center py-8">
        <Trophy className="h-8 w-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-500">
          Join a squad to see the leaderboard
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Trophy className="h-4 w-4 text-orange-500" />
          Leaderboard
        </h3>
      </div>
      <div className="divide-y divide-slate-700/30">
        {sorted.map((entry, index) => (
          <div
            key={entry.user_id}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              entry.user_id === currentUserId && "bg-orange-500/5"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                index === 0 && "bg-yellow-500/20 text-yellow-400",
                index === 1 && "bg-slate-400/20 text-slate-300",
                index === 2 && "bg-amber-700/20 text-amber-600",
                index > 2 && "bg-slate-800 text-slate-500"
              )}
            >
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  entry.user_id === currentUserId
                    ? "text-orange-400"
                    : "text-white"
                )}
              >
                {entry.display_name}
                {entry.user_id === currentUserId && " (You)"}
              </p>
            </div>
            <StreakBadge streak={entry.current_streak} size="sm" />
            <span className="text-sm font-bold text-orange-400 tabular-nums">
              {entry.total_points} pts
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
