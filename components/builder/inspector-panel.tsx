"use client";

import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { FIELD_TYPE_META } from "@/lib/constants";
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
    <div className="space-y-2">
      <Label className="text-[13px] font-normal text-[#86868B]">{label}</Label>
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
  const updateField = useBuilderStore((state) => state.updateField);

  if (!field) {
    return (
      <aside className="w-80 shrink-0 border-l border-[#E5E5EA] bg-white p-5 dark:border-white/10 dark:bg-[#1C1C1E]">
        <p className="text-[13px] text-[#86868B]">Inspector</p>
        <h2 className="mt-1 text-[15px] font-semibold text-[#1D1D1F] dark:text-white">
          No field selected
        </h2>
        <p className="mt-2 text-[13px] leading-5 text-[#86868B]">
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
    <aside className="flex w-80 shrink-0 flex-col border-l border-[#E5E5EA] bg-white dark:border-white/10 dark:bg-[#1C1C1E]">
      <div className="border-b border-[#E5E5EA] px-5 py-4 dark:border-white/10">
        <p className="text-[13px] text-[#86868B]">Inspector</p>
        <h2 className="mt-1 text-[15px] font-semibold text-[#1D1D1F] dark:text-white">
          {FIELD_TYPE_META[field.type].label}
        </h2>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
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
