"use client";

import { Card } from "@/components/ui/card";
import type { WeighIn } from "@/lib/types";

interface WeighInChartProps {
  weighIns: WeighIn[];
}

export function WeighInChart({ weighIns }: WeighInChartProps) {
  if (weighIns.length === 0) {
    return (
      <Card className="text-center py-6">
        <p className="text-sm text-slate-500">No weigh-ins recorded yet</p>
      </Card>
    );
  }

  const sorted = [...weighIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const weights = sorted.map((w) => w.weight);
  const minWeight = Math.min(...weights) - 2;
  const maxWeight = Math.max(...weights) + 2;
  const range = maxWeight - minWeight || 1;

  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const diff = previous ? latest.weight - previous.weight : 0;

  return (
    <Card>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-2xl font-bold text-white">{latest.weight} lbs</p>
          {previous && (
            <p
              className={`text-xs font-medium ${
                diff > 0
                  ? "text-red-400"
                  : diff < 0
                  ? "text-green-400"
                  : "text-slate-500"
              }`}
            >
              {diff > 0 ? "+" : ""}
              {diff.toFixed(1)} lbs from last
            </p>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {new Date(latest.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Simple SVG chart */}
      <div className="h-24 w-full">
        <svg viewBox={`0 0 ${sorted.length * 40} 100`} className="w-full h-full">
          {sorted.length > 1 && (
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinejoin="round"
              points={sorted
                .map((w, i) => {
                  const x = i * 40 + 20;
                  const y = 90 - ((w.weight - minWeight) / range) * 80;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          )}
          {sorted.map((w, i) => {
            const x = i * 40 + 20;
            const y = 90 - ((w.weight - minWeight) / range) * 80;
            return (
              <circle
                key={w.id}
                cx={x}
                cy={y}
                r="3"
                fill="#f97316"
              />
            );
          })}
        </svg>
      </div>
    </Card>
  );
}
