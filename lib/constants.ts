import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Calendar03Icon,
  Call02Icon,
  CheckmarkSquare02Icon,
  CloudUploadIcon,
  HashtagIcon,
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
  backgroundColor: "#FFFFFF",
  textColor: "#1D1D1F",
};

export const DEFAULT_CONFIRMATION: FormConfirmation = {
  title: "Thank you",
  message: "Your response has been recorded.",
  buttonLabel: "Submit another response",
};

export const FONT_STACKS: Record<FormTheme["fontFamily"], string> = {
  "sf-pro":
    '"SF Pro Display", "SF Pro Text", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  inter: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  mono: '"SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace',
};

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  description: string;
  icon: IconSvgElement;
  group: "standard" | "choice" | "media";
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
};

export const FIELD_GROUPS: { id: FieldTypeMeta["group"]; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "choice", label: "Choice" },
  { id: "media", label: "Media" },
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

export function normalizeFormDocument(form: FormDocument): FormDocument {
  return {
    ...form,
    displayMode: form.displayMode ?? "conversational",
    confirmation: {
      ...DEFAULT_CONFIRMATION,
      ...(form.confirmation ?? {}),
    },
    versions: (form.versions ?? []).map((version) => ({
      ...version,
      snapshot: {
        ...version.snapshot,
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
