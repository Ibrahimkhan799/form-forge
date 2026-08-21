export const INPUT_FIELD_TYPES = [
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

export const SHOWCASE_FIELD_TYPES = ["image", "richText"] as const;

export const FIELD_TYPES = [
  ...INPUT_FIELD_TYPES,
  ...SHOWCASE_FIELD_TYPES,
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];
export type InputFieldType = (typeof INPUT_FIELD_TYPES)[number];
export type ShowcaseFieldType = (typeof SHOWCASE_FIELD_TYPES)[number];

export function isInputFieldType(type: FieldType): type is InputFieldType {
  return (INPUT_FIELD_TYPES as readonly string[]).includes(type);
}

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

export interface ComponentStyle {
  width: "full" | "half" | "third";
  alignment: "left" | "center" | "right";
  backgroundColor?: string;
  textColor?: string;
  padding: number;
  borderRadius?: number;
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
  richText?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  imageFit?: "cover" | "contain";
  componentStyle: ComponentStyle;
}

export const FONT_FAMILIES = [
  "sf-pro",
  "inter",
  "dm-sans",
  "manrope",
  "space-grotesk",
  "playfair",
  "source-serif",
  "georgia",
  "mono",
] as const;

export type FontFamily = (typeof FONT_FAMILIES)[number];

export const BACKGROUND_STYLES = ["solid", "gradient", "dots"] as const;

export type BackgroundStyle = (typeof BACKGROUND_STYLES)[number];

export const FORM_DENSITIES = ["compact", "comfortable", "spacious"] as const;
export type FormDensity = (typeof FORM_DENSITIES)[number];

export const BUTTON_STYLES = ["solid", "soft", "outline"] as const;
export type FormButtonStyle = (typeof BUTTON_STYLES)[number];

export const FORM_WIDTHS = ["narrow", "standard", "wide"] as const;
export type FormWidth = (typeof FORM_WIDTHS)[number];

export interface FormTheme {
  primaryColor: string;
  borderRadius: number;
  backgroundStyle: BackgroundStyle;
  fontFamily: string;
  bodyFontFamily: string;
  headingFontFamily: string;
  backgroundColor: string;
  textColor: string;
  surfaceColor: string;
  inputBackgroundColor: string;
  inputBorderColor: string;
  density: FormDensity;
  buttonStyle: FormButtonStyle;
  width: FormWidth;
}

export type FormDisplayMode = "conversational" | "classic";

export interface FormConfirmation {
  title: string;
  message: string;
  buttonLabel: string;
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
    displayMode: FormDisplayMode;
    confirmation: FormConfirmation;
  };
}

export interface FormDocument {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  theme: FormTheme;
  displayMode: FormDisplayMode;
  confirmation: FormConfirmation;
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
