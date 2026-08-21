import type { CSSProperties } from "react";
import { fontFamilyStack } from "@/lib/constants";
import type { FormTheme } from "@/lib/types";

export function themeToStyle(theme: FormTheme): CSSProperties {
  const density = {
    compact: { control: "40px", gap: "20px" },
    comfortable: { control: "44px", gap: "28px" },
    spacious: { control: "50px", gap: "36px" },
  }[theme.density];

  return {
    "--ff-primary": theme.primaryColor,
    "--ff-radius": `${theme.borderRadius}px`,
    "--ff-bg": theme.backgroundColor,
    "--ff-text": theme.textColor,
    "--ff-surface": theme.surfaceColor,
    "--ff-input-bg": theme.inputBackgroundColor,
    "--ff-input-border": theme.inputBorderColor,
    "--ff-control-height": density.control,
    "--ff-field-gap": density.gap,
    "--ff-font": fontFamilyStack(theme.bodyFontFamily),
    "--ff-heading-font": fontFamilyStack(theme.headingFontFamily),
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
