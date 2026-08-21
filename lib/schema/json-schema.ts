import { createId } from "@/lib/id";
import { createField } from "@/lib/constants";
import type { InputFieldType, FormDocument, FormField } from "@/lib/types";
import { INPUT_FIELD_TYPES, isInputFieldType } from "@/lib/types";

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
    showcaseLayers?: FormField[];
    layerOrder?: string[];
  };
}

const JSON_TYPE_MAP: Record<InputFieldType, JsonSchemaProperty> = {
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
  if (!isInputFieldType(field.type)) return {};
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
    if (isInputFieldType(field.type)) {
      properties[field.id] = fieldToJsonSchemaProperty(field);
      if (field.required) required.push(field.id);
    }
    fieldMeta[field.id] = {
      type: field.type,
      placeholder: field.placeholder,
      options: field.options,
      accept: field.accept,
      maxRating: field.maxRating,
      randomizeOptions: field.randomizeOptions,
      componentStyle: field.componentStyle,
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
      showcaseLayers: form.fields.filter((field) => !isInputFieldType(field.type)),
      layerOrder: form.fields.map((field) => field.id),
    },
  };
}

function inferFieldType(key: string, property: JsonSchemaProperty): InputFieldType {
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
  if (INPUT_FIELD_TYPES.includes(lower as InputFieldType)) {
    return lower as InputFieldType;
  }
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
    const type =
      hinted && isInputFieldType(hinted) ? hinted : inferFieldType(key, property);
    const field = createField(type);
    field.id = key || createId(10);
    field.label = property.title || meta[key]?.label || field.label;
    field.helpText = property.description || "";
    field.required = required.has(key);
    field.placeholder = meta[key]?.placeholder ?? field.placeholder;
    field.accept = meta[key]?.accept ?? field.accept;
    field.maxRating = meta[key]?.maxRating ?? property.maximum ?? field.maxRating;
    field.randomizeOptions = meta[key]?.randomizeOptions;
    field.componentStyle = meta[key]?.componentStyle ?? field.componentStyle;

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

  const showcaseLayers = (schema["x-formforge"]?.showcaseLayers ?? []).map(
    (field) => ({ ...createField(field.type), ...field })
  );
  const combined = [...fields, ...showcaseLayers];
  const order = schema["x-formforge"]?.layerOrder ?? [];
  const orderedFields = order.length
    ? [...combined].sort(
        (a, b) =>
          (order.indexOf(a.id) === -1 ? Number.MAX_SAFE_INTEGER : order.indexOf(a.id)) -
          (order.indexOf(b.id) === -1 ? Number.MAX_SAFE_INTEGER : order.indexOf(b.id))
      )
    : combined;

  return {
    title: schema.title || "Imported form",
    description: schema.description || "",
    fields: orderedFields,
  };
}

export function parseJsonSchema(raw: string): FormJsonSchema {
  const parsed = JSON.parse(raw) as FormJsonSchema;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON schema");
  }
  return parsed;
}
