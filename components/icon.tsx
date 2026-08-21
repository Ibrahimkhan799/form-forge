"use client";

import { HugeiconsIcon, type HugeiconsIconProps, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface IconProps extends Omit<HugeiconsIconProps, "icon"> {
  icon: IconSvgElement;
  className?: string;
}

export function Icon({ icon, className, size = 18, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color="currentColor"
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}
