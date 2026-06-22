"use client";

import { CircleDot, Check, Monitor, Square, Webcam } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecorderSource } from "@/features/recorder/types/recorder";

interface SourceSelectorProps {
  value: RecorderSource;
  onChange: (source: RecorderSource) => void;
}

const sourceOptions: {
  value: RecorderSource;
  label: string;
  icon: typeof Monitor;
  desc: string;
}[] = [
  { value: "screen", label: "Entire Screen", icon: Monitor, desc: "Record your whole desktop" },
  { value: "window", label: "Window", icon: Square, desc: "Record a specific app" },
  { value: "tab", label: "Browser Tab", icon: CircleDot, desc: "Record a single tab" },
  { value: "webcam", label: "Webcam Only", icon: Webcam, desc: "Record your camera" },
];

export function SourceSelector({ value, onChange }: SourceSelectorProps) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        1. Select Capture Source
      </label>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {sourceOptions.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-start gap-2.5 rounded-2xl border p-4 text-left transition-all group relative overflow-hidden",
                selected
                  ? "border-purple-500/80 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "border-border/60 bg-card/40 hover:border-border hover:bg-card/80"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                selected ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"
              )}>
                <option.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold">{option.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{option.desc}</p>
              </div>
              {selected && (
                <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
