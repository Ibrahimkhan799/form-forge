"use client";

import { DEFAULT_THEME } from "@/lib/constants";
import {
  BACKGROUND_STYLES,
  BUTTON_STYLES,
  FORM_DENSITIES,
  FORM_WIDTHS,
} from "@/lib/types";
import type {
  BackgroundStyle,
  FormButtonStyle,
  FormDensity,
  FormWidth,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FontPicker } from "@/components/fonts/font-picker";
import { Label } from "@/components/ui/label";
import { useBuilderStore } from "@/lib/store/builder-store";
import {
  RightPanelTabs,
  type RightPanelView,
} from "@/components/builder/right-panel-tabs";
import { Slider } from "@/components/ui/slider";
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

export function AppearancePanel({
  onViewChange,
}: {
  onViewChange: (view: RightPanelView) => void;
}) {
  const theme = useBuilderStore((state) => state.form?.theme);
  const updateTheme = useBuilderStore((state) => state.updateTheme);

  if (!theme) return null;

  return (
    <aside className="flex h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden border-l border-border/80 bg-card shadow-[-4px_0_18px_rgba(0,0,0,0.04)] lg:shadow-none">
      <div className="space-y-3 border-b border-border/70 px-3 py-3">
        <RightPanelTabs value="appearance" onChange={onViewChange} />
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] text-muted-foreground">Form theme</p>
            <h2 className="mt-0.5 text-[13px] font-semibold">Appearance</h2>
          </div>
        </div>
      </div>

      <div className="editor-scrollbar min-h-0 flex-1 space-y-5 overflow-y-scroll overscroll-contain px-4 py-4">
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

          <Section
            title="Typography"
            description="Search the complete Google Fonts catalog; selected fonts load on demand."
          >
            <div className="grid grid-cols-2 gap-2">
              <FontPicker
                label="Body"
                value={theme.bodyFontFamily}
                onChange={(bodyFontFamily) =>
                  updateTheme({ bodyFontFamily, fontFamily: bodyFontFamily })
                }
              />
              <FontPicker
                label="Heading"
                value={theme.headingFontFamily}
                onChange={(headingFontFamily) =>
                  updateTheme({ headingFontFamily })
                }
              />
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
                <Slider
                  label="Form corner radius"
                  min={4}
                  max={24}
                  value={theme.borderRadius}
                  onValueChange={(borderRadius) =>
                    updateTheme({ borderRadius })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </Section>
      </div>

      <div className="flex items-center justify-between border-t border-border/70 bg-card px-4 py-2.5">
        <p className="text-[10px] text-muted-foreground">Changes autosave</p>
        <Button
          variant="outline"
          className="h-7 text-[10px]"
          onClick={() => updateTheme({ ...DEFAULT_THEME })}
        >
          Reset
        </Button>
      </div>
    </aside>
  );
}
