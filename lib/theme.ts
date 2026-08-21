import type { CSSProperties } from "react";
import { FONT_STACKS } from "@/lib/constants";
import type { FormTheme } from "@/lib/types";

export function themeToStyle(theme: FormTheme): CSSProperties {
  return {
    "--ff-primary": theme.primaryColor,
    "--ff-radius": `${theme.borderRadius}px`,
    "--ff-bg": theme.backgroundColor,
    "--ff-text": theme.textColor,
    "--ff-font": FONT_STACKS[theme.fontFamily],
  } as CSSProperties;
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
