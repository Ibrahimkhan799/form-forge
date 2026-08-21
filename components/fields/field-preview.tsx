"use client";

import type { FormField } from "@/lib/types";
import {
  AppleCheckbox,
  AppleRadio,
  AppleSelect,
  DatePicker,
  FileDropzone,
  StarRating,
} from "@/components/fields/controls";

export function FieldPreview({ field }: { field: FormField }) {
  const options = field.options ?? [];

  switch (field.type) {
    case "text":
    case "email":
    case "phone":
    case "number":
      return (
        <input
          disabled
          type={field.type === "number" ? "number" : "text"}
          placeholder={field.placeholder || "Answer"}
          className="ff-input pointer-events-none"
        />
      );
    case "date":
      return <DatePicker disabled placeholder={field.placeholder || "Pick a date"} />;
    case "dropdown":
      return (
        <AppleSelect
          disabled
          value=""
          placeholder={field.placeholder || "Select an option"}
          options={options}
        />
      );
    case "radio":
      return (
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <AppleRadio key={option.id} disabled label={option.label} checked={false} />
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <AppleCheckbox key={option.id} disabled label={option.label} checked={false} />
          ))}
        </div>
      );
    case "rating":
      return <StarRating disabled value={0} max={field.maxRating ?? 5} />;
    case "file":
      return <FileDropzone disabled accept={field.accept} />;
  }
}
