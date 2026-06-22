"use client";

import { Check, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecordingQuality } from "@/types/recording";

interface QualitySelectorProps {
  value: RecordingQuality;
  onChange: (quality: RecordingQuality) => void;
}

const qualityOptions: {
  value: RecordingQuality;
  label: string;
  resolution: string;
  badge?: string;
}[] = [
  { value: "720p", label: "HD", resolution: "1280 × 720" },
  { value: "1080p", label: "Full HD", resolution: "1920 × 1080", badge: "Recommended" },
  { value: "1440p", label: "QHD", resolution: "2560 × 1440", badge: "Pro" },
];

export function QualitySelector({ value, onChange }: QualitySelectorProps) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Gauge className="h-3.5 w-3.5" />
        Recording Quality
      </label>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {qualityOptions.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all",
                selected
                  ? "border-purple-500/80 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "border-border/60 bg-card/40 hover:border-border hover:bg-card/80"
              )}
            >
              {option.badge && (
                <span className={cn(
                  "absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide",
                  option.badge === "Pro"
                    ? "bg-amber-500/20 text-amber-500"
                    : "bg-emerald-500/20 text-emerald-500"
                )}>
                  {option.badge}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold">{option.value}</span>
                {selected && <Check className="h-3 w-3 text-purple-500" />}
              </div>
              <span className="text-[10px] text-muted-foreground">{option.label}</span>
              <span className="text-[9px] text-muted-foreground/70 font-mono">{option.resolution}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
