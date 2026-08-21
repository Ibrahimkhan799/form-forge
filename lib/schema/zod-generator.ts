import { z } from "zod";
import type { FormField } from "@/lib/types";

const PHONE_PATTERN = /^[+]?[\d\s().-]{7,20}$/;

function applyRequired<T extends z.ZodTypeAny>(schema: T, required: boolean) {
  if (required) return schema;
  return schema.optional();
}

export function fieldToZod(field: FormField): z.ZodTypeAny {
  const v = field.validation ?? {};

  switch (field.type) {
    case "text": {
      let schema = z.string();
      if (field.required) schema = schema.min(1, "This field is required");
      if (v.minLength) {
        schema = schema.min(v.minLength, `Use at least ${v.minLength} characters`);
      }
      if (v.maxLength) {
        schema = schema.max(v.maxLength, `Use at most ${v.maxLength} characters`);
      }
      if (v.pattern) {
        try {
          schema = schema.regex(
            new RegExp(v.pattern),
            v.patternMessage || "This value is not valid"
          );
        } catch {
          // Ignore invalid user-supplied regex.
        }
      }
      return field.required ? schema : schema.optional().or(z.literal(""));
    }
    case "email": {
      const schema = z
        .string()
        .min(field.required ? 1 : 0, "This field is required")
        .email("Enter a valid email address");
      return field.required ? schema : z.union([schema, z.literal("")]);
    }
    case "phone": {
      const schema = z
        .string()
        .min(field.required ? 1 : 0, "This field is required")
        .regex(PHONE_PATTERN, "Enter a valid phone number");
      return field.required ? schema : z.union([schema, z.literal("")]);
    }
    case "number": {
      let schema = z.coerce.number({ invalid_type_error: "Enter a number" });
      if (typeof v.min === "number") schema = schema.min(v.min, `Must be at least ${v.min}`);
      if (typeof v.max === "number") schema = schema.max(v.max, `Must be at most ${v.max}`);
      return applyRequired(schema, field.required);
    }
    case "dropdown":
    case "radio": {
      const schema = z.string();
      return field.required
        ? schema.min(1, "Please select an option")
        : schema.optional().or(z.literal(""));
    }
    case "checkbox": {
      const schema = z.array(z.string());
      return field.required
        ? schema.min(1, "Select at least one option")
        : schema.optional().default([]);
    }
    case "date": {
      const schema = z.string();
      return field.required
        ? schema.min(1, "Please pick a date")
        : schema.optional().or(z.literal(""));
    }
    case "file": {
      const schema = z.object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
      });
      return field.required ? schema : schema.optional().nullable();
    }
    case "rating": {
      const schema = z
        .coerce.number()
        .min(1, "Please choose a rating")
        .max(field.maxRating ?? 5);
      return applyRequired(schema, field.required);
    }
  }
}

export function buildZodSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.id] = fieldToZod(field);
  }
  return z.object(shape);
}

export function defaultValueForField(field: FormField): unknown {
  switch (field.type) {
    case "checkbox":
      return [];
    case "number":
      return "";
    case "rating":
      return 0;
    case "file":
      return null;
    default:
      return "";
  }
}

export function buildDefaultValues(fields: FormField[]) {
  return Object.fromEntries(fields.map((field) => [field.id, defaultValueForField(field)]));
}
