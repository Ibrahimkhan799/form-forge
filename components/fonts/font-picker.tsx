"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown01Icon, Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { GoogleFontLoader } from "@/components/fonts/google-font-loader";
import { Icon } from "@/components/icon";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const FALLBACK_FONTS = [
  "Inter",
  "DM Sans",
  "Manrope",
  "Space Grotesk",
  "Playfair Display",
  "Source Serif 4",
  "JetBrains Mono",
  "Lora",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Poppins",
];

export function FontPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (font: string) => void;
}) {
  const [fonts, setFonts] = useState(FALLBACK_FONTS);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/google-fonts")
      .then((response) => response.json() as Promise<{ fonts?: string[] }>)
      .then((data) => {
        if (active && data.fonts?.length) setFonts(data.fonts);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const visibleFonts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? fonts.filter((font) => font.toLowerCase().includes(needle))
      : fonts;
    return filtered.slice(0, 80);
  }, [fonts, query]);

  return (
    <>
      <GoogleFontLoader families={[value]} />
      <div>
        <p className="mb-1.5 text-[11px] text-muted-foreground">{label}</p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="flex h-8 w-full items-center justify-between rounded-[7px] border border-border bg-card px-2.5 text-left text-[11px]"
              />
            }
          >
            <span className="truncate" style={{ fontFamily: `"${value}", sans-serif` }}>
              {value}
            </span>
            <Icon icon={ArrowDown01Icon} size={12} className="text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[280px] gap-1.5 p-1.5">
            <div className="relative">
              <Icon
                icon={Search01Icon}
                size={12}
                className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${fonts.length.toLocaleString()} fonts`}
                className="h-8 pl-7"
              />
            </div>
            <div className="max-h-64 overflow-y-auto overscroll-contain py-0.5">
              {visibleFonts.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => {
                    onChange(font);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex h-8 w-full items-center justify-between rounded-[6px] px-2 text-left text-[11px] hover:bg-muted"
                >
                  <span className="truncate">{font}</span>
                  {font === value ? (
                    <Icon icon={Tick02Icon} size={12} className="text-[#007AFF]" />
                  ) : null}
                </button>
              ))}
              {visibleFonts.length === 0 ? (
                <p className="px-2 py-4 text-center text-[10px] text-muted-foreground">
                  No matching Google Font
                </p>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
