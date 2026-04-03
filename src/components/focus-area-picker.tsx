"use client";

import { cn } from "@/lib/utils";
import { FOCUS_AREAS, type FocusArea } from "@/lib/types";

interface FocusAreaPickerProps {
  selected: FocusArea[];
  onChange: (areas: FocusArea[]) => void;
}

const AREA_ICONS: Record<FocusArea, string> = {
  chest: "\uD83D\uDCAA",
  back: "\uD83E\uDDB4",
  shoulders: "\uD83C\uDFCB\uFE0F",
  arms: "\uD83D\uDCAA",
  legs: "\uD83E\uDDB5",
  glutes: "\uD83C\uDF51",
  core: "\uD83E\uDD4B",
  full_body: "\u26A1",
};

export function FocusAreaPicker({ selected, onChange }: FocusAreaPickerProps) {
  function toggle(area: FocusArea) {
    if (area === "full_body") {
      onChange(selected.includes("full_body") ? [] : ["full_body"]);
      return;
    }

    const withoutFullBody = selected.filter((a) => a !== "full_body");
    if (withoutFullBody.includes(area)) {
      onChange(withoutFullBody.filter((a) => a !== area));
    } else {
      onChange([...withoutFullBody, area]);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {FOCUS_AREAS.map((area) => {
        const isSelected = selected.includes(area.value);
        return (
          <button
            key={area.value}
            type="button"
            onClick={() => toggle(area.value)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-3 text-left transition-all",
              isSelected
                ? "border-orange-500 bg-orange-500/10 text-orange-400"
                : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
            )}
          >
            <span className="text-lg">{AREA_ICONS[area.value]}</span>
            <span className="text-sm font-medium">{area.label}</span>
          </button>
        );
      })}
    </div>
  );
}
