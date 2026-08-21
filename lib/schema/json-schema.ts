import { createId } from "@/lib/id";
import { createField } from "@/lib/constants";
import type { FieldType, FormDocument, FormField } from "@/lib/types";
import { FIELD_TYPES } from "@/lib/types";

export interface JsonSchemaProperty {
  type?: string | string[];
  title?: string;
  description?: string;
  format?: string;
  enum?: unknown[];
  items?: JsonSchemaProperty;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  minItems?: number;
}

export interface FormJsonSchema {
  $schema?: string;
  title?: string;
  description?: string;
  type?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  "x-formforge"?: {
    theme?: FormDocument["theme"];
    displayMode?: FormDocument["displayMode"];
    confirmation?: FormDocument["confirmation"];
    fieldMeta?: Record<string, Partial<FormField>>;
  };
}

const JSON_TYPE_MAP: Record<FieldType, JsonSchemaProperty> = {
  text: { type: "string" },
  email: { type: "string", format: "email" },
  phone: { type: "string" },
  number: { type: "number" },
  dropdown: { type: "string" },
  radio: { type: "string" },
  checkbox: { type: "array", items: { type: "string" } },
  date: { type: "string", format: "date" },
  file: {
    type: "object",
  },
  rating: { type: "integer", minimum: 1, maximum: 5 },
};

export function fieldToJsonSchemaProperty(field: FormField): JsonSchemaProperty {
  const base: JsonSchemaProperty = {
    ...JSON_TYPE_MAP[field.type],
    title: field.label,
    description: field.helpText || undefined,
  };

  if (field.type === "dropdown" || field.type === "radio" || field.type === "checkbox") {
    const values = (field.options ?? []).map((option) => option.label);
    if (field.type === "checkbox") {
      base.items = { type: "string", enum: values };
    } else {
      base.enum = values;
    }
  }

  if (field.type === "text") {
    if (field.validation?.minLength) base.minLength = field.validation.minLength;
    if (field.validation?.maxLength) base.maxLength = field.validation.maxLength;
    if (field.validation?.pattern) base.pattern = field.validation.pattern;
  }

  if (field.type === "number") {
    if (typeof field.validation?.min === "number") base.minimum = field.validation.min;
    if (typeof field.validation?.max === "number") base.maximum = field.validation.max;
  }

  if (field.type === "rating") {
    base.maximum = field.maxRating ?? 5;
  }

  if (field.type === "file") {
    base.description = field.accept
      ? `${field.helpText || "Uploaded file"} (${field.accept})`
      : field.helpText;
  }

  return base;
}

export function formToJsonSchema(form: FormDocument): FormJsonSchema {
  const properties: Record<string, JsonSchemaProperty> = {};
  const required: string[] = [];
  const fieldMeta: Record<string, Partial<FormField>> = {};

  for (const field of form.fields) {
    properties[field.id] = fieldToJsonSchemaProperty(field);
    if (field.required) required.push(field.id);
    fieldMeta[field.id] = {
      type: field.type,
      placeholder: field.placeholder,
      options: field.options,
      accept: field.accept,
      maxRating: field.maxRating,
      randomizeOptions: field.randomizeOptions,
    };
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: form.title,
    description: form.description,
    type: "object",
    properties,
    required,
    "x-formforge": {
      theme: form.theme,
      displayMode: form.displayMode,
      confirmation: form.confirmation,
      fieldMeta,
    },
  };
}

function inferFieldType(key: string, property: JsonSchemaProperty): FieldType {
  if (property.format === "email") return "email";
  if (property.format === "date") return "date";
  if (property.format === "tel") return "phone";
  if (property.type === "integer" && property.maximum && property.maximum <= 10) return "rating";
  if (property.type === "number" || property.type === "integer") return "number";
  if (property.type === "array") return "checkbox";
  if (property.type === "object") return "file";
  if (Array.isArray(property.enum)) return "radio";
  const lower = key.toLowerCase();
  if (lower.includes("email")) return "email";
  if (lower.includes("phone") || lower.includes("tel")) return "phone";
  if (FIELD_TYPES.includes(lower as FieldType)) return lower as FieldType;
  return "text";
}

export function jsonSchemaToFields(schema: FormJsonSchema): {
  title: string;
  description: string;
  fields: FormField[];
} {
  const properties = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const meta = schema["x-formforge"]?.fieldMeta ?? {};

  const fields = Object.entries(properties).map(([key, property]) => {
    const hinted = meta[key]?.type;
    const type = hinted && FIELD_TYPES.includes(hinted) ? hinted : inferFieldType(key, property);
    const field = createField(type);
    field.id = key || createId(10);
    field.label = property.title || meta[key]?.label || field.label;
    field.helpText = property.description || "";
    field.required = required.has(key);
    field.placeholder = meta[key]?.placeholder ?? field.placeholder;
    field.accept = meta[key]?.accept ?? field.accept;
    field.maxRating = meta[key]?.maxRating ?? property.maximum ?? field.maxRating;
    field.randomizeOptions = meta[key]?.randomizeOptions;

    if (type === "text") {
      field.validation = {
        minLength: property.minLength,
        maxLength: property.maxLength,
        pattern: property.pattern,
      };
    }
    if (type === "number") {
      field.validation = {
        min: property.minimum,
        max: property.maximum,
      };
    }

    const enumValues =
      (property.enum as string[] | undefined) ??
      (property.items?.enum as string[] | undefined) ??
      meta[key]?.options?.map((option) => option.label);

    if (enumValues && (type === "dropdown" || type === "radio" || type === "checkbox")) {
      field.options = enumValues.map((label) => ({
        id: createId(8),
        label: String(label),
      }));
    } else if (meta[key]?.options) {
      field.options = meta[key]?.options;
    }

    return field;
  });

  return {
    title: schema.title || "Imported form",
    description: schema.description || "",
    fields,
  };
}

export function parseJsonSchema(raw: string): FormJsonSchema {
  const parsed = JSON.parse(raw) as FormJsonSchema;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON schema");
  }
  return parsed;
}
