"use client";

import { useState } from "react";
import { Controller, type Control } from "react-hook-form";
import type { FormField } from "@/lib/types";
import {
  AppleCheckbox,
  AppleRadio,
  AppleSelect,
  FileDropzone,
  StarRating,
} from "@/components/fields/controls";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-[13px] text-[#FF3B30]">{message}</p>;
}

export function FieldInput({
  field,
  control,
  autoFocus,
  onEnter,
}: {
  field: FormField;
  control: Control<Record<string, unknown>>;
  autoFocus?: boolean;
  onEnter?: () => void;
}) {
  const [options] = useState(() => {
    const list = [...(field.options ?? [])];
    if (!field.randomizeOptions) return list;
    for (let index = list.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      const current = list[index];
      list[index] = list[swap];
      list[swap] = current;
    }
    return list;
  });

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onEnter?.();
    }
  }

  return (
    <Controller
      control={control}
      name={field.id}
      render={({ field: rhf, fieldState }) => {
        switch (field.type) {
          case "text":
          case "email":
          case "phone":
          case "number":
          case "date":
            return (
              <div>
                <input
                  autoFocus={autoFocus}
                  onKeyDown={handleKeyDown}
                  type={
                    field.type === "number"
                      ? "number"
                      : field.type === "date"
                        ? "date"
                        : field.type === "email"
                          ? "email"
                          : field.type === "phone"
                            ? "tel"
                            : "text"
                  }
                  value={(rhf.value as string | number | undefined) ?? ""}
                  placeholder={field.placeholder}
                  onChange={rhf.onChange}
                  onBlur={rhf.onBlur}
                  className="ff-input"
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            );
          case "dropdown":
            return (
              <div>
                <AppleSelect
                  value={(rhf.value as string) ?? ""}
                  placeholder={field.placeholder || "Select an option"}
                  options={options}
                  onChange={rhf.onChange}
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            );
          case "radio":
            return (
              <div className="flex flex-col gap-2">
                {options.map((option) => (
                  <AppleRadio
                    key={option.id}
                    name={field.id}
                    label={option.label}
                    checked={rhf.value === option.label}
                    onChange={() => rhf.onChange(option.label)}
                  />
                ))}
                <FieldError message={fieldState.error?.message} />
              </div>
            );
          case "checkbox": {
            const selected = Array.isArray(rhf.value) ? (rhf.value as string[]) : [];
            return (
              <div className="flex flex-col gap-2">
                {options.map((option) => (
                  <AppleCheckbox
                    key={option.id}
                    label={option.label}
                    checked={selected.includes(option.label)}
                    onChange={(checked) => {
                      rhf.onChange(
                        checked
                          ? [...selected, option.label]
                          : selected.filter((item) => item !== option.label)
                      );
                    }}
                  />
                ))}
                <FieldError message={fieldState.error?.message} />
              </div>
            );
          }
          case "rating":
            return (
              <div>
                <StarRating
                  value={Number(rhf.value) || 0}
                  max={field.maxRating ?? 5}
                  onChange={rhf.onChange}
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            );
          case "file":
            return (
              <div>
                <FileDropzone
                  value={rhf.value as { name: string; size: number; type: string } | null}
                  accept={field.accept}
                  onChange={rhf.onChange}
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            );
        }
      }}
    />
  );
}
