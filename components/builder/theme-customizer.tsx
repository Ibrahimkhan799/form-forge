"use client";

import { FONT_STACKS } from "@/lib/constants";
import { FONT_FAMILIES, BACKGROUND_STYLES } from "@/lib/types";
import type { BackgroundStyle, FontFamily } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useBuilderStore } from "@/lib/store/builder-store";
import { cn } from "@/lib/utils";

const SWATCHES = ["#007AFF", "#34C759", "#FF3B30", "#AF52DE", "#FF9500", "#1D1D1F"];

const FONT_LABELS: Record<FontFamily, string> = {
  "sf-pro": "SF Pro",
  inter: "Inter",
  georgia: "Georgia",
  mono: "Mono",
};

const STYLE_LABELS: Record<BackgroundStyle, string> = {
  solid: "Solid",
  gradient: "Gradient",
  dots: "Dots",
};

export function ThemeCustomizer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const theme = useBuilderStore((state) => state.form?.theme);
  const updateTheme = useBuilderStore((state) => state.updateTheme);

  if (!theme) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Theme</DialogTitle>
          <DialogDescription>
            Customize how the published form looks for respondents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className="text-[13px] font-normal text-[#86868B]">Accent color</Label>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateTheme({ primaryColor: color })}
                  aria-label={color}
                  className={cn(
                    "size-8 rounded-full transition-transform duration-150",
                    theme.primaryColor === color ? "scale-110 ring-2 ring-offset-2" : ""
                  )}
                  style={{
                    background: color,
                    ["--tw-ring-color" as string]: color,
                  }}
                />
              ))}
              <label className="grid size-8 place-items-center overflow-hidden rounded-full border border-[#D2D2D7]">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(event) => updateTheme({ primaryColor: event.target.value })}
                  className="size-10 -translate-x-1 -translate-y-1 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div>
            <Label className="text-[13px] font-normal text-[#86868B]">Background style</Label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BACKGROUND_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateTheme({ backgroundStyle: style })}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-[13px] transition-colors duration-150",
                    theme.backgroundStyle === style
                      ? "border-[#007AFF] text-[#007AFF]"
                      : "border-[#E5E5EA] text-[#1D1D1F] dark:border-white/10 dark:text-white"
                  )}
                >
                  {STYLE_LABELS[style]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[13px] font-normal text-[#86868B]">Font family</Label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => updateTheme({ fontFamily: font })}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-[13px] transition-colors duration-150",
                    theme.fontFamily === font
                      ? "border-[#007AFF] text-[#007AFF]"
                      : "border-[#E5E5EA] text-[#1D1D1F] dark:border-white/10 dark:text-white"
                  )}
                  style={{ fontFamily: FONT_STACKS[font] }}
                >
                  {FONT_LABELS[font]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-normal text-[#86868B]">Corner radius</Label>
              <span className="text-[13px] text-[#1D1D1F] dark:text-white">
                {theme.borderRadius}px
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={24}
              value={theme.borderRadius}
              onChange={(event) =>
                updateTheme({ borderRadius: Number(event.target.value) })
              }
              className="mt-3 w-full accent-[#007AFF]"
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="h-8 rounded-[8px]"
              onClick={() =>
                updateTheme({
                  primaryColor: "#007AFF",
                  borderRadius: 12,
                  backgroundStyle: "solid",
                  fontFamily: "sf-pro",
                  backgroundColor: "#FFFFFF",
                  textColor: "#1D1D1F",
                })
              }
            >
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
