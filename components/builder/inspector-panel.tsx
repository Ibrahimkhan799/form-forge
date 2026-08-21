"use client";

import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { CONFIRMATION_ID, FIELD_TYPE_META } from "@/lib/constants";
import { createId } from "@/lib/id";
import type { FormField } from "@/lib/types";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useBuilderStore, useSelectedField } from "@/lib/store/builder-store";

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-normal text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function OptionsEditor({ field }: { field: FormField }) {
  const updateField = useBuilderStore((state) => state.updateField);
  const options = field.options ?? [];

  function updateOption(id: string, label: string) {
    updateField(field.id, {
      options: options.map((option) => (option.id === id ? { ...option, label } : option)),
    });
  }

  function removeOption(id: string) {
    updateField(field.id, {
      options: options.filter((option) => option.id !== id),
    });
  }

  function addOption() {
    updateField(field.id, {
      options: [...options, { id: createId(8), label: `Option ${options.length + 1}` }],
    });
  }

  return (
    <div className="space-y-2">
      <Label className="text-[13px] font-normal text-[#86868B]">Choices</Label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <Input
              value={option.label}
              onChange={(event) => updateOption(option.id, event.target.value)}
              className="h-9 rounded-xl text-[13px]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-[8px] text-[#FF3B30]"
              onClick={() => removeOption(option.id)}
              aria-label="Remove option"
            >
              <Icon icon={Delete02Icon} size={14} />
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        onClick={addOption}
        className="h-8 w-full rounded-[8px] text-[13px]"
      >
        <Icon icon={PlusSignIcon} size={14} />
        Add option
      </Button>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[13px] text-[#86868B]">Randomize order</span>
        <Switch
          checked={Boolean(field.randomizeOptions)}
          onCheckedChange={(checked) =>
            updateField(field.id, { randomizeOptions: checked })
          }
        />
      </div>
    </div>
  );
}

export function InspectorPanel() {
  const field = useSelectedField();
  const form = useBuilderStore((state) => state.form);
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);
  const updateField = useBuilderStore((state) => state.updateField);
  const updateConfirmation = useBuilderStore((state) => state.updateConfirmation);

  if (selectedFieldId === CONFIRMATION_ID && form) {
    return (
      <aside className="flex min-h-0 w-72 shrink-0 flex-col overflow-hidden border-l border-border/80 bg-card">
        <div className="border-b border-border/80 px-4 py-3">
          <p className="text-[10px] text-muted-foreground">Inspector</p>
          <h2 className="mt-0.5 text-[13px] font-semibold text-foreground">
            Confirmation
          </h2>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3">
          <FieldRow label="Title">
            <Input
              value={form.confirmation.title}
              onChange={(event) => updateConfirmation({ title: event.target.value })}
              className="h-9 rounded-xl px-4 text-[13px]"
            />
          </FieldRow>
          <FieldRow label="Message">
            <Textarea
              value={form.confirmation.message}
              onChange={(event) => updateConfirmation({ message: event.target.value })}
              className="min-h-24 rounded-xl px-4 text-[13px]"
            />
          </FieldRow>
          <FieldRow label="Restart button">
            <Input
              value={form.confirmation.buttonLabel}
              onChange={(event) => updateConfirmation({ buttonLabel: event.target.value })}
              className="h-9 rounded-xl px-4 text-[13px]"
            />
          </FieldRow>
          <p className="text-[12px] leading-5 text-[#86868B]">
            The restart button is shown in preview and after a successful public submission.
          </p>
        </div>
      </aside>
    );
  }

  if (!field) {
    return (
      <aside className="min-h-0 w-72 shrink-0 overflow-hidden border-l border-border/80 bg-card p-4">
        <p className="text-[10px] text-muted-foreground">Inspector</p>
        <h2 className="mt-1 text-[13px] font-semibold text-foreground">
          No field selected
        </h2>
        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
          Click a question on the canvas to edit its label, validation, and options.
        </p>
      </aside>
    );
  }

  const validation = field.validation ?? {};
  const hasOptions =
    field.type === "dropdown" || field.type === "radio" || field.type === "checkbox";
  const hasLength = field.type === "text";
  const hasRange = field.type === "number";

  return (
    <aside className="flex min-h-0 w-72 shrink-0 flex-col overflow-hidden border-l border-border/80 bg-card">
      <div className="border-b border-border/80 px-4 py-3">
        <p className="text-[10px] text-muted-foreground">Inspector</p>
        <h2 className="mt-0.5 text-[13px] font-semibold text-foreground">
          {FIELD_TYPE_META[field.type].label}
        </h2>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3">
        <FieldRow label="Label">
          <Input
            value={field.label}
            onChange={(event) => updateField(field.id, { label: event.target.value })}
            className="h-9 rounded-xl text-[13px]"
          />
        </FieldRow>
        <FieldRow label="Placeholder">
          <Input
            value={field.placeholder ?? ""}
            onChange={(event) => updateField(field.id, { placeholder: event.target.value })}
            className="h-9 rounded-xl text-[13px]"
          />
        </FieldRow>
        <FieldRow label="Help text">
          <Textarea
            value={field.helpText ?? ""}
            onChange={(event) => updateField(field.id, { helpText: event.target.value })}
            className="min-h-16 rounded-xl text-[13px]"
          />
        </FieldRow>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#1D1D1F] dark:text-white">Required</span>
          <Switch
            checked={field.required}
            onCheckedChange={(checked) => updateField(field.id, { required: checked })}
          />
        </div>

        {hasOptions ? <OptionsEditor field={field} /> : null}

        {hasLength ? (
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Min length">
              <Input
                type="number"
                min={0}
                value={validation.minLength ?? ""}
                onChange={(event) =>
                  updateField(field.id, {
                    validation: {
                      ...validation,
                      minLength: event.target.value ? Number(event.target.value) : undefined,
                    },
                  })
                }
                className="h-9 rounded-xl text-[13px]"
              />
            </FieldRow>
            <FieldRow label="Max length">
              <Input
                type="number"
                min={0}
                value={validation.maxLength ?? ""}
                onChange={(event) =>
                  updateField(field.id, {
                    validation: {
                      ...validation,
                      maxLength: event.target.value ? Number(event.target.value) : undefined,
                    },
                  })
                }
                className="h-9 rounded-xl text-[13px]"
              />
            </FieldRow>
            <div className="col-span-2">
              <FieldRow label="Pattern">
                <Input
                  value={validation.pattern ?? ""}
                  placeholder="Regular expression"
                  onChange={(event) =>
                    updateField(field.id, {
                      validation: { ...validation, pattern: event.target.value || undefined },
                    })
                  }
                  className="h-9 rounded-xl text-[13px]"
                />
              </FieldRow>
            </div>
          </div>
        ) : null}

        {hasRange ? (
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Minimum">
              <Input
                type="number"
                value={validation.min ?? ""}
                onChange={(event) =>
                  updateField(field.id, {
                    validation: {
                      ...validation,
                      min: event.target.value ? Number(event.target.value) : undefined,
                    },
                  })
                }
                className="h-9 rounded-xl text-[13px]"
              />
            </FieldRow>
            <FieldRow label="Maximum">
              <Input
                type="number"
                value={validation.max ?? ""}
                onChange={(event) =>
                  updateField(field.id, {
                    validation: {
                      ...validation,
                      max: event.target.value ? Number(event.target.value) : undefined,
                    },
                  })
                }
                className="h-9 rounded-xl text-[13px]"
              />
            </FieldRow>
          </div>
        ) : null}

        {field.type === "rating" ? (
          <FieldRow label="Max rating">
            <Input
              type="number"
              min={3}
              max={10}
              value={field.maxRating ?? 5}
              onChange={(event) =>
                updateField(field.id, { maxRating: Number(event.target.value) || 5 })
              }
              className="h-9 rounded-xl text-[13px]"
            />
          </FieldRow>
        ) : null}

        {field.type === "file" ? (
          <FieldRow label="Accepted files">
            <Input
              value={field.accept ?? ""}
              onChange={(event) => updateField(field.id, { accept: event.target.value })}
              className="h-9 rounded-xl text-[13px]"
            />
          </FieldRow>
        ) : null}
      </div>
    </aside>
  );
}
