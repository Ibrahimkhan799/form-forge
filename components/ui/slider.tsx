"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
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
  return (
    <SliderPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      className={cn("w-full", className)}
    >
      <SliderPrimitive.Control className="relative flex h-6 w-full touch-none items-center">
        <SliderPrimitive.Track className="absolute right-0 left-0 h-1.5 overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Indicator className="h-full rounded-full bg-[#007AFF]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          getAriaLabel={() => label}
          className="z-10 size-4 rounded-full border border-[#007AFF]/50 bg-card shadow-[0_1px_4px_rgba(0,0,0,0.25)] outline-none ring-[#007AFF]/20 transition-transform data-dragging:scale-110 focus-visible:ring-4"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
