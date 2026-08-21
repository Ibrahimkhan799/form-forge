export const FIELD_TYPES = [
  "text",
  "email",
  "phone",
  "number",
  "dropdown",
  "radio",
  "checkbox",
  "date",
  "file",
  "rating",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export interface FieldOption {
  id: string;
  label: string;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: FieldOption[];
  validation?: FieldValidation;
  maxRating?: number;
  accept?: string;
  randomizeOptions?: boolean;
}

export const FONT_FAMILIES = [
  "sf-pro",
  "inter",
  "georgia",
  "mono",
] as const;

export type FontFamily = (typeof FONT_FAMILIES)[number];

export const BACKGROUND_STYLES = ["solid", "gradient", "dots"] as const;

export type BackgroundStyle = (typeof BACKGROUND_STYLES)[number];

export interface FormTheme {
  primaryColor: string;
  borderRadius: number;
  backgroundStyle: BackgroundStyle;
  fontFamily: FontFamily;
  backgroundColor: string;
  textColor: string;
}

export interface FormVersion {
  id: string;
  createdAt: string;
  label: string;
  snapshot: {
    title: string;
    description: string;
    fields: FormField[];
    theme: FormTheme;
  };
}

export interface FormDocument {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  theme: FormTheme;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  versions: FormVersion[];
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedAt: string;
  completed: boolean;
}

export interface FormVisit {
  id: string;
  formId: string;
  visitedAt: string;
}

export type BuilderMode = "edit" | "preview";
export type SaveStatus = "saved" | "saving" | "unsaved";
