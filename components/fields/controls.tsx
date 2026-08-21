"use client";

import { useState } from "react";
import { CloudUploadIcon, StarIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

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
        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-150",
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
      <span className="text-[15px] text-[#1D1D1F] dark:text-white">{label}</span>
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
        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-150",
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
      <span className="text-[15px] text-[#1D1D1F] dark:text-white">{label}</span>
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

export function FileDropzone({
  value,
  accept,
  onChange,
  disabled,
}: {
  value?: { name: string; size: number; type: string } | null;
  accept?: string;
  onChange?: (file: { name: string; size: number; type: string } | null) => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);

  function takeFile(file?: File) {
    if (!file) return;
    onChange?.({ name: file.name, size: file.size, type: file.type });
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
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-all duration-150",
        dragging
          ? "border-[var(--ff-primary,#007AFF)] bg-[color-mix(in_srgb,var(--ff-primary,#007AFF)_8%,transparent)]"
          : "border-[#D2D2D7] bg-[#FAFAFA] hover:border-[#B0B0B5] dark:border-white/15 dark:bg-white/5",
        disabled && "cursor-default"
      )}
    >
      <Icon icon={CloudUploadIcon} size={28} className="text-[#86868B]" />
      <div>
        <p className="text-[15px] text-[#1D1D1F] dark:text-white">
          {value?.name || "Drop a file here or browse"}
        </p>
        <p className="mt-1 text-[13px] text-[#86868B]">
          {value ? `${Math.ceil(value.size / 1024)} KB` : "PNG, JPG, or PDF"}
        </p>
      </div>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
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
