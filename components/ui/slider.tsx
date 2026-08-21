"use client";

import { cn } from "@/lib/utils";

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className,
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  className?: string;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex h-7 w-full items-center", className)}>
      <div className="pointer-events-none absolute right-0 left-0 h-1.5 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
        <div
          className="h-full rounded-full bg-[#007AFF]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onValueChange(Number(event.target.value))}
        className="ui-slider-input absolute inset-x-0 h-7 w-full cursor-pointer"
      />
    </div>
  );
}
