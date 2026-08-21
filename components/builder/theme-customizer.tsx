"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_THEME, FONT_STACKS } from "@/lib/constants";
import {
  BACKGROUND_STYLES,
  BUTTON_STYLES,
  FONT_FAMILIES,
  FORM_DENSITIES,
  FORM_WIDTHS,
} from "@/lib/types";
import type {
  BackgroundStyle,
  FontFamily,
  FormButtonStyle,
  FormDensity,
  FormWidth,
} from "@/lib/types";
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

const SWATCHES = [
  "#007AFF",
  "#5856D6",
  "#AF52DE",
  "#34C759",
  "#FF9500",
  "#FF3B30",
  "#1D1D1F",
];

const FONT_LABELS: Record<FontFamily, string> = {
  "sf-pro": "SF Pro",
  inter: "Inter",
  "dm-sans": "DM Sans",
  manrope: "Manrope",
  "space-grotesk": "Space Grotesk",
  playfair: "Playfair Display",
  "source-serif": "Source Serif",
  georgia: "Georgia",
  mono: "JetBrains Mono",
};

const STYLE_LABELS: Record<BackgroundStyle, string> = {
  solid: "Solid",
  gradient: "Gradient",
  dots: "Dots",
};

const DENSITY_LABELS: Record<FormDensity, string> = {
  compact: "Compact",
  comfortable: "Comfortable",
  spacious: "Spacious",
};

const BUTTON_LABELS: Record<FormButtonStyle, string> = {
  solid: "Solid",
  soft: "Soft",
  outline: "Outline",
};

const WIDTH_LABELS: Record<FormWidth, string> = {
  narrow: "Narrow",
  standard: "Standard",
  wide: "Wide",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border/70 pb-5 last:border-0 last:pb-0">
      <div className="mb-3">
        <h3 className="text-[12px] font-medium text-foreground">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-[8px] border border-border px-3 py-2">
      <span className="text-[11px] text-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">{value.toUpperCase()}</span>
        <span
          className="relative size-6 overflow-hidden rounded-full ring-1 ring-black/10"
          style={{ background: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="absolute -inset-2 size-10 cursor-pointer opacity-0"
            aria-label={label}
          />
        </span>
      </span>
    </label>
  );
}

function OptionGrid<T extends string>({
  values,
  selected,
  labels,
  onChange,
  columns = 3,
}: {
  values: readonly T[];
  selected: T;
  labels: Record<T, string>;
  onChange: (value: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <div className={cn("grid gap-1.5", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
      {values.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "h-8 rounded-[7px] border px-2 text-[11px] transition-colors",
            selected === value
              ? "border-[#007AFF] bg-[#007AFF]/6 text-[#007AFF]"
              : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          {labels[value]}
        </button>
      ))}
    </div>
  );
}

export function ThemeCustomizer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const theme = useBuilderStore((state) => state.form?.theme);
  const updateTheme = useBuilderStore((state) => state.updateTheme);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      scrollAreaRef.current?.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (!theme) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-3 bottom-3 grid h-auto max-h-none w-[min(560px,calc(100vw-24px))] max-w-none -translate-y-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-[12px] p-0">
        <DialogHeader className="border-b border-border/70 px-4 py-3.5">
          <DialogTitle>Appearance</DialogTitle>
          <DialogDescription>
            Fine-tune color, typography, spacing, and form controls.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={scrollAreaRef}
          className="min-h-0 space-y-5 overflow-y-auto overscroll-contain px-4 py-4"
        >
          <Section title="Accent" description="Used for actions, focus, and selection.">
            <div className="flex flex-wrap items-center gap-2">
              {SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateTheme({ primaryColor: color })}
                  aria-label={`Use ${color}`}
                  className={cn(
                    "size-7 rounded-full ring-offset-2 transition-transform",
                    theme.primaryColor === color && "scale-105 ring-2"
                  )}
                  style={{
                    background: color,
                    ["--tw-ring-color" as string]: color,
                  }}
                />
              ))}
            </div>
          </Section>

          <Section title="Colors" description="Set the page, card, text, and input palette.">
            <div className="grid grid-cols-2 gap-2">
              <ColorControl
                label="Page"
                value={theme.backgroundColor}
                onChange={(backgroundColor) => updateTheme({ backgroundColor })}
              />
              <ColorControl
                label="Form card"
                value={theme.surfaceColor}
                onChange={(surfaceColor) => updateTheme({ surfaceColor })}
              />
              <ColorControl
                label="Text"
                value={theme.textColor}
                onChange={(textColor) => updateTheme({ textColor })}
              />
              <ColorControl
                label="Input fill"
                value={theme.inputBackgroundColor}
                onChange={(inputBackgroundColor) => updateTheme({ inputBackgroundColor })}
              />
              <div className="col-span-2">
                <ColorControl
                  label="Input border"
                  value={theme.inputBorderColor}
                  onChange={(inputBorderColor) => updateTheme({ inputBorderColor })}
                />
              </div>
            </div>
          </Section>

          <Section title="Background">
            <OptionGrid
              values={BACKGROUND_STYLES}
              selected={theme.backgroundStyle}
              labels={STYLE_LABELS}
              onChange={(backgroundStyle) => updateTheme({ backgroundStyle })}
            />
          </Section>

          <Section title="Google fonts" description="Fonts are embedded and served by Next.js.">
            <div className="grid grid-cols-2 gap-1.5">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => updateTheme({ fontFamily: font })}
                  className={cn(
                    "flex h-9 items-center rounded-[7px] border px-3 text-left text-[12px] transition-colors",
                    theme.fontFamily === font
                      ? "border-[#007AFF] bg-[#007AFF]/6 text-[#007AFF]"
                      : "border-border text-foreground hover:bg-muted/60"
                  )}
                  style={{ fontFamily: FONT_STACKS[font] }}
                >
                  {FONT_LABELS[font]}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Layout">
            <div className="space-y-3">
              <div>
                <Label className="mb-2 text-[11px] font-normal text-muted-foreground">Density</Label>
                <OptionGrid
                  values={FORM_DENSITIES}
                  selected={theme.density}
                  labels={DENSITY_LABELS}
                  onChange={(density) => updateTheme({ density })}
                />
              </div>
              <div>
                <Label className="mb-2 text-[11px] font-normal text-muted-foreground">Form width</Label>
                <OptionGrid
                  values={FORM_WIDTHS}
                  selected={theme.width}
                  labels={WIDTH_LABELS}
                  onChange={(width) => updateTheme({ width })}
                />
              </div>
              <div>
                <Label className="mb-2 text-[11px] font-normal text-muted-foreground">Button style</Label>
                <OptionGrid
                  values={BUTTON_STYLES}
                  selected={theme.buttonStyle}
                  labels={BUTTON_LABELS}
                  onChange={(buttonStyle) => updateTheme({ buttonStyle })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-normal text-muted-foreground">
                    Corner radius
                  </Label>
                  <span className="text-[11px] text-foreground">
                    {theme.borderRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={24}
                  value={theme.borderRadius}
                  onChange={(event) =>
                    updateTheme({ borderRadius: Number(event.target.value) })
                  }
                  className="mt-2 w-full accent-[#007AFF]"
                />
              </div>
            </div>
          </Section>
        </div>

        <div className="flex items-center justify-between border-t border-border/70 bg-popover px-4 py-2.5">
          <p className="text-[10px] text-muted-foreground">Changes autosave</p>
          <Button
            variant="outline"
            className="h-8 rounded-[8px] text-[12px]"
            onClick={() => updateTheme({ ...DEFAULT_THEME })}
          >
            Reset appearance
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
