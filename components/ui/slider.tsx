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
      <SliderPrimitive.Control className="flex h-5 touch-none items-center">
        <SliderPrimitive.Track className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Indicator className="rounded-full bg-[#007AFF]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          getAriaLabel={() => label}
          className="size-4 rounded-full border border-[#007AFF]/40 bg-card shadow-[0_1px_4px_rgba(0,0,0,0.2)] outline-none ring-[#007AFF]/20 transition-transform data-dragging:scale-110 focus-visible:ring-4"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
