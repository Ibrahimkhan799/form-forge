import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Calendar03Icon,
  Call02Icon,
  CheckmarkSquare02Icon,
  CloudUploadIcon,
  HashtagIcon,
  Image01Icon,
  Mail01Icon,
  RadioButtonIcon,
  StarIcon,
  TextIcon,
} from "@hugeicons/core-free-icons";
import type {
  FieldType,
  FormConfirmation,
  FormDocument,
  FormField,
  FormTheme,
  FormVersion,
} from "@/lib/types";
import { createId } from "@/lib/id";

export const APP_NAME = "FormForge";
export const CONFIRMATION_ID = "__confirmation__";

export const DEFAULT_THEME: FormTheme = {
  primaryColor: "#007AFF",
  borderRadius: 12,
  backgroundStyle: "solid",
  fontFamily: "sf-pro",
  bodyFontFamily: "Inter",
  headingFontFamily: "Inter",
  backgroundColor: "#FFFFFF",
  textColor: "#1D1D1F",
  surfaceColor: "#FFFFFF",
  inputBackgroundColor: "#FFFFFF",
  inputBorderColor: "#D2D2D7",
  density: "comfortable",
  buttonStyle: "solid",
  width: "standard",
};

export const DEFAULT_CONFIRMATION: FormConfirmation = {
  title: "Thank you",
  message: "<p>Your response has been recorded.</p>",
  buttonLabel: "Submit another response",
};

export const FONT_STACKS: Record<string, string> = {
  "sf-pro":
    '"SF Pro Display", "SF Pro Text", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  inter: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "dm-sans": 'var(--font-dm-sans), "DM Sans", sans-serif',
  manrope: 'var(--font-manrope), Manrope, sans-serif',
  "space-grotesk": 'var(--font-space-grotesk), "Space Grotesk", sans-serif',
  playfair: 'var(--font-playfair), "Playfair Display", Georgia, serif',
  "source-serif": 'var(--font-source-serif), "Source Serif 4", Georgia, serif',
  georgia: 'Georgia, "Times New Roman", serif',
  mono: 'var(--font-jetbrains-mono), "SF Mono", ui-monospace, Menlo, monospace',
};

export function fontFamilyStack(family: string) {
  return (
    FONT_STACKS[family] ??
    `"${family.replaceAll('"', "")}", var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  );
}

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  description: string;
  icon: IconSvgElement;
  group: "standard" | "choice" | "media" | "content";
}

export const FIELD_TYPE_META: Record<FieldType, FieldTypeMeta> = {
  text: {
    type: "text",
    label: "Short answer",
    description: "Single line text",
    icon: TextIcon,
    group: "standard",
  },
  email: {
    type: "email",
    label: "Email",
    description: "Email address",
    icon: Mail01Icon,
    group: "standard",
  },
  phone: {
    type: "phone",
    label: "Phone",
    description: "Phone number",
    icon: Call02Icon,
    group: "standard",
  },
  number: {
    type: "number",
    label: "Number",
    description: "Numeric value",
    icon: HashtagIcon,
    group: "standard",
  },
  date: {
    type: "date",
    label: "Date",
    description: "Date picker",
    icon: Calendar03Icon,
    group: "standard",
  },
  dropdown: {
    type: "dropdown",
    label: "Dropdown",
    description: "Select from a list",
    icon: ArrowDown01Icon,
    group: "choice",
  },
  radio: {
    type: "radio",
    label: "Multiple choice",
    description: "Pick one option",
    icon: RadioButtonIcon,
    group: "choice",
  },
  checkbox: {
    type: "checkbox",
    label: "Checkboxes",
    description: "Pick many options",
    icon: CheckmarkSquare02Icon,
    group: "choice",
  },
  rating: {
    type: "rating",
    label: "Star rating",
    description: "1 to 5 stars",
    icon: StarIcon,
    group: "choice",
  },
  file: {
    type: "file",
    label: "File upload",
    description: "Drag and drop files",
    icon: CloudUploadIcon,
    group: "media",
  },
  image: {
    type: "image",
    label: "Image",
    description: "Visual content block",
    icon: Image01Icon,
    group: "content",
  },
  richText: {
    type: "richText",
    label: "Rich text",
    description: "Formatted content block",
    icon: TextIcon,
    group: "content",
  },
};

export const FIELD_GROUPS: { id: FieldTypeMeta["group"]; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "choice", label: "Choice" },
  { id: "media", label: "Media" },
  { id: "content", label: "Content" },
];

function defaultOptions(): FormField["options"] {
  return [
    { id: createId(8), label: "Option 1" },
    { id: createId(8), label: "Option 2" },
    { id: createId(8), label: "Option 3" },
  ];
}

export function createField(type: FieldType): FormField {
  const base: FormField = {
    id: createId(10),
    type,
    label: FIELD_TYPE_META[type].label,
    placeholder: "",
    helpText: "",
    required: false,
    componentStyle: {
      width: "full",
      alignment: "left",
      padding: 0,
    },
  };

  switch (type) {
    case "text":
      return { ...base, label: "Your name", placeholder: "Type your answer" };
    case "email":
      return { ...base, label: "Email address", placeholder: "name@example.com" };
    case "phone":
      return { ...base, label: "Phone number", placeholder: "+1 (555) 000-0000" };
    case "number":
      return {
        ...base,
        label: "Quantity",
        placeholder: "0",
        validation: { min: 0 },
      };
    case "date":
      return { ...base, label: "Pick a date" };
    case "dropdown":
      return {
        ...base,
        label: "Choose one",
        placeholder: "Select an option",
        options: defaultOptions(),
      };
    case "radio":
      return {
        ...base,
        label: "Which option fits best?",
        options: defaultOptions(),
      };
    case "checkbox":
      return {
        ...base,
        label: "Select all that apply",
        options: defaultOptions(),
      };
    case "rating":
      return { ...base, label: "How would you rate this?", maxRating: 5 };
    case "file":
      return {
        ...base,
        label: "Upload a file",
        helpText: "PNG, JPG, or PDF up to 10 MB",
        accept: "image/*,.pdf",
      };
    case "image":
      return {
        ...base,
        label: "Image",
        imageUrl:
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Team collaborating around a table",
        imageCaption: "",
        imageFit: "cover",
        componentStyle: {
          ...base.componentStyle,
          borderRadius: 12,
        },
      };
    case "richText":
      return {
        ...base,
        label: "Rich text",
        richText:
          "<h3>Share a little context</h3><p>Add supporting copy, instructions, links, or a short story between questions.</p>",
      };
  }
}

export function createBlankForm(title = "Untitled form"): FormDocument {
  const now = new Date().toISOString();
  return {
    id: createId(10),
    title,
    description: "",
    fields: [createField("text")],
    theme: { ...DEFAULT_THEME },
    displayMode: "conversational",
    confirmation: { ...DEFAULT_CONFIRMATION },
    published: false,
    createdAt: now,
    updatedAt: now,
    versions: [],
  };
}

export function cloneSnapshot(form: FormDocument): FormVersion["snapshot"] {
  return structuredClone({
    title: form.title,
    description: form.description,
    fields: form.fields,
    theme: form.theme,
    displayMode: form.displayMode,
    confirmation: form.confirmation,
  });
}

const LEGACY_FONT_NAMES: Record<string, string> = {
  "sf-pro": "Inter",
  inter: "Inter",
  "dm-sans": "DM Sans",
  manrope: "Manrope",
  "space-grotesk": "Space Grotesk",
  playfair: "Playfair Display",
  "source-serif": "Source Serif 4",
  georgia: "Lora",
  mono: "JetBrains Mono",
};

function normalizeField(field: FormField): FormField {
  return {
    ...field,
    componentStyle: {
      width: "full",
      alignment: "left",
      padding: 0,
      ...(field.componentStyle ?? {}),
    },
  };
}

export function normalizeFormDocument(form: FormDocument): FormDocument {
  const legacyFont = LEGACY_FONT_NAMES[form.theme?.fontFamily] ?? "Inter";
  return {
    ...form,
    fields: (form.fields ?? []).map(normalizeField),
    theme: {
      ...DEFAULT_THEME,
      ...(form.theme ?? {}),
      bodyFontFamily: form.theme?.bodyFontFamily ?? legacyFont,
      headingFontFamily: form.theme?.headingFontFamily ?? legacyFont,
    },
    displayMode: form.displayMode ?? "conversational",
    confirmation: {
      ...DEFAULT_CONFIRMATION,
      ...(form.confirmation ?? {}),
    },
    versions: (form.versions ?? []).map((version) => ({
      ...version,
      snapshot: {
        ...version.snapshot,
        theme: {
          ...DEFAULT_THEME,
          ...(version.snapshot.theme ?? form.theme ?? {}),
          bodyFontFamily:
            version.snapshot.theme?.bodyFontFamily ??
            form.theme?.bodyFontFamily ??
            legacyFont,
          headingFontFamily:
            version.snapshot.theme?.headingFontFamily ??
            form.theme?.headingFontFamily ??
            legacyFont,
        },
        fields: (version.snapshot.fields ?? []).map(normalizeField),
        displayMode: version.snapshot.displayMode ?? form.displayMode ?? "conversational",
        confirmation: {
          ...DEFAULT_CONFIRMATION,
          ...(version.snapshot.confirmation ?? form.confirmation ?? {}),
        },
      },
    })),
  };
}

export const DEMO_FORM_ID = "welcome";

export function createDemoForm(): FormDocument {
  const name = createField("text");
  name.id = "name";
  name.label = "What should we call you?";
  name.placeholder = "Your name";
  name.required = true;

  const email = createField("email");
  email.id = "email";
  email.required = true;

  const role = createField("radio");
  role.id = "role";
  role.label = "What best describes you?";
  role.required = true;
  role.options = [
    { id: "role-designer", label: "Product designer" },
    { id: "role-engineer", label: "Engineer" },
    { id: "role-founder", label: "Founder" },
    { id: "role-other", label: "Something else" },
  ];

  const tools = createField("checkbox");
  tools.id = "tools";
  tools.label = "Which tools do you use today?";
  tools.options = [
    { id: "tool-typeform", label: "Typeform" },
    { id: "tool-gforms", label: "Google Forms" },
    { id: "tool-webflow", label: "Webflow" },
    { id: "tool-notion", label: "Notion" },
  ];

  const rating = createField("rating");
  rating.id = "rating";
  rating.label = "How was your first impression?";
  rating.required = true;

  const date = createField("date");
  date.id = "follow-up";
  date.label = "When would you like a follow-up?";

  const now = new Date().toISOString();
  return {
    id: DEMO_FORM_ID,
    title: "Product feedback",
    description: "A two-minute pulse check to help us shape FormForge.",
    fields: [name, email, role, tools, rating, date],
    theme: { ...DEFAULT_THEME },
    displayMode: "conversational",
    confirmation: { ...DEFAULT_CONFIRMATION },
    published: true,
    createdAt: now,
    updatedAt: now,
    versions: [
      {
        id: createId(8),
        createdAt: now,
        label: "Initial draft",
        snapshot: {
          title: "Product feedback",
          description: "A two-minute pulse check to help us shape FormForge.",
          fields: [name, email, role, tools, rating, date],
          theme: { ...DEFAULT_THEME },
          displayMode: "conversational",
          confirmation: { ...DEFAULT_CONFIRMATION },
        },
      },
    ],
  };
}
