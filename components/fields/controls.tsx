"use client";

import { useState } from "react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  CloudUploadIcon,
  Loading03Icon,
  StarIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { StoredAssetRef } from "@/lib/types";
import { storeUpload } from "@/lib/upload-store";

export function AppleRadio({
  checked,
  label,
  name,
  onChange,
  disabled,
}: {
  checked: boolean;
  label: string;
  name?: string;
  onChange?: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "ff-choice-row flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-150",
        checked
          ? "border-[var(--ff-primary,#007AFF)] bg-[color-mix(in_srgb,var(--ff-primary,#007AFF)_8%,transparent)]"
          : "border-[#D2D2D7] bg-white hover:border-[#B0B0B5] dark:border-white/10 dark:bg-white/5",
        disabled && "cursor-default opacity-80"
      )}
    >
      <span
        className={cn(
          "grid size-5 place-items-center rounded-full border-2 transition-colors duration-150",
          checked
            ? "border-[var(--ff-primary,#007AFF)]"
            : "border-[#C7C7CC]"
        )}
      >
        <span
          className={cn(
            "size-2.5 rounded-full transition-transform duration-150",
            checked ? "scale-100 bg-[var(--ff-primary,#007AFF)]" : "scale-0"
          )}
        />
      </span>
      <input
        type="radio"
        name={name}
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className="ff-choice-label text-[15px] text-[#1D1D1F] dark:text-white">
        {label}
      </span>
    </label>
  );
}

export function AppleCheckbox({
  checked,
  label,
  onChange,
  disabled,
}: {
  checked: boolean;
  label: string;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "ff-choice-row flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-150",
        checked
          ? "border-[var(--ff-primary,#007AFF)] bg-[color-mix(in_srgb,var(--ff-primary,#007AFF)_8%,transparent)]"
          : "border-[#D2D2D7] bg-white hover:border-[#B0B0B5] dark:border-white/10 dark:bg-white/5",
        disabled && "cursor-default opacity-80"
      )}
    >
      <span
        className={cn(
          "grid size-5 place-items-center rounded-[6px] border-2 transition-colors duration-150",
          checked
            ? "border-[var(--ff-primary,#007AFF)] bg-[var(--ff-primary,#007AFF)]"
            : "border-[#C7C7CC] bg-white"
        )}
      >
        {checked ? <Icon icon={Tick02Icon} size={12} className="text-white" /> : null}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className="ff-choice-label text-[15px] text-[#1D1D1F] dark:text-white">
        {label}
      </span>
    </label>
  );
}

export function StarRating({
  value,
  max = 5,
  onChange,
  disabled,
}: {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: max }, (_, index) => {
        const score = index + 1;
        const active = shown >= score;
        return (
          <button
            key={score}
            type="button"
            disabled={disabled}
            aria-label={`${score} star${score === 1 ? "" : "s"}`}
            onMouseEnter={() => !disabled && setHovered(score)}
            onClick={() => onChange?.(score)}
            className="rounded-lg p-1 transition-transform duration-150 hover:scale-110 disabled:hover:scale-100"
          >
            <Icon
              icon={StarIcon}
              size={28}
              className={cn(
                "transition-colors duration-150",
                active ? "text-[#FF9F0A] fill-current" : "text-[#D2D2D7]"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function DatePicker({
  value,
  placeholder = "Pick a date",
  onChange,
  disabled,
}: {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const selected = value ? parseISO(value) : undefined;
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selected && !Number.isNaN(selected.getTime()) ? selected : new Date())
  );
  const gridStart = startOfWeek(startOfMonth(visibleMonth));
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            className="ff-input flex items-center justify-between text-left disabled:pointer-events-none"
          />
        }
      >
        <span className={value ? "" : "text-[#86868B]"}>
          {selected && !Number.isNaN(selected.getTime())
            ? format(selected, "MMM d, yyyy")
            : placeholder}
        </span>
        <Icon icon={Calendar03Icon} size={17} className="text-[#86868B]" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[296px] gap-3 rounded-2xl border border-[#E5E5EA] bg-white p-3 text-[#1D1D1F] shadow-[0_16px_40px_rgba(0,0,0,0.14)] ring-0"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            className="grid size-8 place-items-center rounded-[8px] text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
            aria-label="Previous month"
          >
            <Icon icon={ArrowLeft01Icon} size={15} />
          </button>
          <p className="text-[13px] font-medium">{format(visibleMonth, "MMMM yyyy")}</p>
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            className="grid size-8 place-items-center rounded-[8px] text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
            aria-label="Next month"
          >
            <Icon icon={ArrowRight01Icon} size={15} />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] text-[#86868B]">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span key={day} className="py-1">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const active = selected ? isSameDay(day, selected) : false;
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  onChange?.(format(day, "yyyy-MM-dd"));
                  setOpen(false);
                }}
                className={cn(
                  "grid size-9 place-items-center rounded-[9px] text-[12px] transition-colors",
                  !isSameMonth(day, visibleMonth) && "text-[#C7C7CC]",
                  isToday(day) && !active && "bg-[#F5F5F7] font-medium",
                  active
                    ? "bg-[var(--ff-primary,#007AFF)] text-white"
                    : "hover:bg-[#F5F5F7]"
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            onChange?.(format(today, "yyyy-MM-dd"));
            setVisibleMonth(startOfMonth(today));
            setOpen(false);
          }}
          className="h-8 rounded-[8px] bg-[#F5F5F7] text-[12px] text-[#007AFF] hover:bg-[#EEEEF0]"
        >
          Today
        </button>
      </PopoverContent>
    </Popover>
  );
}

export function FileDropzone({
  value,
  accept,
  onChange,
  disabled,
}: {
  value?: StoredAssetRef | null;
  accept?: string;
  onChange?: (file: StoredAssetRef | null) => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function takeFile(file?: File) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Files must be smaller than 10 MB");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      onChange?.(await storeUpload(file));
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        takeFile(event.dataTransfer.files[0]);
      }}
      className={cn(
        "ff-file-drop flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-5 py-8 text-center transition-all duration-150",
        dragging
          ? "border-[var(--ff-primary,#007AFF)] bg-[color-mix(in_srgb,var(--ff-primary,#007AFF)_8%,transparent)]"
          : "border-[#D2D2D7] bg-[#FAFAFA] hover:border-[#B0B0B5] dark:border-white/15 dark:bg-white/5",
        (disabled || uploading) && "cursor-default"
      )}
    >
      <Icon
        icon={uploading ? Loading03Icon : CloudUploadIcon}
        size={28}
        className={cn("text-[#86868B]", uploading && "animate-spin")}
      />
      <div>
        <p className="text-[15px] text-[#1D1D1F] dark:text-white">
          {uploading ? "Uploading…" : value?.name || "Drop a file here or browse"}
        </p>
        <p className="mt-1 text-[13px] text-[#86868B]">
          {error
            ? error
            : value
              ? `${Math.ceil(value.size / 1024)} KB · stored securely in this browser`
              : "PNG, JPG, or PDF · up to 10 MB"}
        </p>
      </div>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => takeFile(event.target.files?.[0])}
      />
    </label>
  );
}

export function AppleSelect({
  value,
  placeholder,
  options,
  onChange,
  disabled,
}: {
  value: string;
  placeholder?: string;
  options: { id: string; label: string }[];
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
      className="ff-input appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22><path fill=%22%2386868B%22 d=%22M1 1l5 5 5-5%22/></svg>')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10"
    >
      <option value="">{placeholder || "Select an option"}</option>
      {options.map((option) => (
        <option key={option.id} value={option.label}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
