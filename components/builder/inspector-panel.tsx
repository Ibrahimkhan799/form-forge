"use client";

import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { CONFIRMATION_ID, FIELD_TYPE_META } from "@/lib/constants";
import { createId } from "@/lib/id";
import { isInputFieldType, type ComponentStyle, type FormField } from "@/lib/types";
import { Icon } from "@/components/icon";
import { AssetUpload } from "@/components/fields/asset-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useBuilderStore, useSelectedField } from "@/lib/store/builder-store";
import {
  RightPanelTabs,
  type RightPanelView,
} from "@/components/builder/right-panel-tabs";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

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

function PanelShell({
  title,
  onViewChange,
  children,
}: {
  title: string;
  onViewChange: (view: RightPanelView) => void;
  children: React.ReactNode;
}) {
  return (
    <aside className="flex min-h-0 w-[22rem] max-w-[calc(100vw-24px)] shrink-0 flex-col overflow-hidden border-l border-border/80 bg-card shadow-[-4px_0_18px_rgba(0,0,0,0.04)] lg:shadow-none">
      <div className="space-y-3 border-b border-border/80 px-3 py-3">
        <RightPanelTabs value="inspector" onChange={onViewChange} />
        <div>
          <p className="text-[10px] text-muted-foreground">Inspector</p>
          <h2 className="mt-0.5 text-[13px] font-semibold text-foreground">{title}</h2>
        </div>
      </div>
      <div className="editor-scrollbar h-0 min-h-0 flex-1 overflow-x-hidden overflow-y-scroll">
        <div className="space-y-4 px-4 pt-3 pr-8 pb-32">{children}</div>
      </div>
    </aside>
  );
}

function OptionsEditor({ field }: { field: FormField }) {
  const updateField = useBuilderStore((state) => state.updateField);
  const options = field.options ?? [];

  return (
    <FieldRow label="Choices">
      <div className="space-y-1.5">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-1.5">
            <Input
              value={option.label}
              onChange={(event) =>
                updateField(field.id, {
                  options: options.map((item) =>
                    item.id === option.id ? { ...item, label: event.target.value } : item
                  ),
                })
              }
            />
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive"
              onClick={() =>
                updateField(field.id, {
                  options: options.filter((item) => item.id !== option.id),
                })
              }
              aria-label="Remove option"
            >
              <Icon icon={Delete02Icon} size={13} />
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        onClick={() =>
          updateField(field.id, {
            options: [
              ...options,
              { id: createId(8), label: `Option ${options.length + 1}` },
            ],
          })
        }
        className="mt-1.5 h-7 w-full text-[10px]"
      >
        <Icon icon={PlusSignIcon} size={12} />
        Add option
      </Button>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Randomize order</span>
        <Switch
          checked={Boolean(field.randomizeOptions)}
          onCheckedChange={(checked) =>
            updateField(field.id, { randomizeOptions: checked })
          }
        />
      </div>
    </FieldRow>
  );
}

function StyleEditor({ field }: { field: FormField }) {
  const updateField = useBuilderStore((state) => state.updateField);
  const style = field.componentStyle;

  function updateStyle(patch: Partial<ComponentStyle>) {
    updateField(field.id, { componentStyle: { ...style, ...patch } });
  }

  return (
    <div className="space-y-3 border-t border-border/70 pt-4">
      <div>
        <p className="text-[11px] font-medium">Layer style</p>
        <p className="text-[10px] text-muted-foreground">
          Overrides only this layer.
        </p>
      </div>
      <FieldRow label="Width">
        <div className="grid grid-cols-3 gap-1">
          {(["full", "half", "third"] as const).map((width) => (
            <button
              key={width}
              type="button"
              onClick={() => updateStyle({ width })}
              className={cn(
                "h-7 rounded-[6px] border text-[10px] capitalize",
                style.width === width
                  ? "border-[#007AFF] bg-[#007AFF]/6 text-[#007AFF]"
                  : "border-border text-muted-foreground"
              )}
            >
              {width}
            </button>
          ))}
        </div>
      </FieldRow>
      <FieldRow label="Alignment">
        <div className="grid grid-cols-3 gap-1">
          {(["left", "center", "right"] as const).map((alignment) => (
            <button
              key={alignment}
              type="button"
              onClick={() => updateStyle({ alignment })}
              className={cn(
                "h-7 rounded-[6px] border text-[10px] capitalize",
                style.alignment === alignment
                  ? "border-[#007AFF] bg-[#007AFF]/6 text-[#007AFF]"
                  : "border-border text-muted-foreground"
              )}
            >
              {alignment}
            </button>
          ))}
        </div>
      </FieldRow>
      <div className="grid grid-cols-2 gap-2">
        <FieldRow label="Background">
          <label className="flex h-8 items-center justify-between rounded-[7px] border border-border px-2">
            <span className="text-[9px] text-muted-foreground">
              {style.backgroundColor || "None"}
            </span>
            <input
              type="color"
              value={style.backgroundColor || "#FFFFFF"}
              onChange={(event) => updateStyle({ backgroundColor: event.target.value })}
              className="size-5 cursor-pointer rounded border-0 bg-transparent"
            />
          </label>
        </FieldRow>
        <FieldRow label="Text">
          <label className="flex h-8 items-center justify-between rounded-[7px] border border-border px-2">
            <span className="text-[9px] text-muted-foreground">
              {style.textColor || "Theme"}
            </span>
            <input
              type="color"
              value={style.textColor || "#1D1D1F"}
              onChange={(event) => updateStyle({ textColor: event.target.value })}
              className="size-5 cursor-pointer rounded border-0 bg-transparent"
            />
          </label>
        </FieldRow>
      </div>
      <FieldRow label={`Padding · ${style.padding}px`}>
        <Slider
          label="Layer padding"
          min={0}
          max={40}
          step={4}
          value={style.padding}
          onValueChange={(padding) => updateStyle({ padding })}
        />
      </FieldRow>
      <FieldRow label={`Corner radius · ${style.borderRadius ?? 0}px`}>
        <Slider
          label="Layer corner radius"
          min={0}
          max={24}
          value={style.borderRadius ?? 0}
          onValueChange={(borderRadius) => updateStyle({ borderRadius })}
        />
      </FieldRow>
    </div>
  );
}

export function InspectorPanel({
  onViewChange,
}: {
  onViewChange: (view: RightPanelView) => void;
}) {
  const field = useSelectedField();
  const form = useBuilderStore((state) => state.form);
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);
  const updateField = useBuilderStore((state) => state.updateField);
  const updateConfirmation = useBuilderStore((state) => state.updateConfirmation);

  if (selectedFieldId === CONFIRMATION_ID && form) {
    return (
      <PanelShell title="Confirmation" onViewChange={onViewChange}>
        <FieldRow label="Title">
          <Input
            value={form.confirmation.title}
            onChange={(event) => updateConfirmation({ title: event.target.value })}
          />
        </FieldRow>
        <FieldRow label="Message">
          <RichTextEditor
            value={form.confirmation.message}
            onChange={(message) => updateConfirmation({ message })}
            minHeight={140}
          />
        </FieldRow>
        <FieldRow label="Restart button">
          <Input
            value={form.confirmation.buttonLabel}
            onChange={(event) =>
              updateConfirmation({ buttonLabel: event.target.value })
            }
          />
        </FieldRow>
        <p className="text-[10px] leading-4 text-muted-foreground">
          The formatted message appears after a successful submission.
        </p>
      </PanelShell>
    );
  }

  if (!field) {
    return (
      <PanelShell title="Nothing selected" onViewChange={onViewChange}>
        <p className="text-[11px] leading-4 text-muted-foreground">
          Select a layer on the canvas or in the Layers panel to edit it.
        </p>
      </PanelShell>
    );
  }

  const isInput = isInputFieldType(field.type);
  const validation = field.validation ?? {};
  const hasOptions =
    field.type === "dropdown" || field.type === "radio" || field.type === "checkbox";

  return (
    <PanelShell
      title={FIELD_TYPE_META[field.type].label}
      onViewChange={onViewChange}
    >
      <FieldRow label={isInput ? "Label" : "Layer name"}>
        <Input
          value={field.label}
          onChange={(event) => updateField(field.id, { label: event.target.value })}
        />
      </FieldRow>

      {field.type === "image" ? (
        <>
          <FieldRow label="Upload">
            <AssetUpload
              value={field.imageAsset}
              onChange={(imageAsset) => updateField(field.id, { imageAsset })}
            />
          </FieldRow>
          <FieldRow label="Image URL">
            <Textarea
              value={field.imageUrl ?? ""}
              onChange={(event) => updateField(field.id, { imageUrl: event.target.value })}
              className="min-h-20"
            />
          </FieldRow>
          <FieldRow label="Alternative text">
            <Input
              value={field.imageAlt ?? ""}
              onChange={(event) => updateField(field.id, { imageAlt: event.target.value })}
            />
          </FieldRow>
          <FieldRow label="Caption">
            <Input
              value={field.imageCaption ?? ""}
              onChange={(event) =>
                updateField(field.id, { imageCaption: event.target.value })
              }
            />
          </FieldRow>
          <FieldRow label="Image fit">
            <div className="grid grid-cols-2 gap-1">
              {(["cover", "contain"] as const).map((imageFit) => (
                <button
                  key={imageFit}
                  type="button"
                  onClick={() => updateField(field.id, { imageFit })}
                  className={cn(
                    "h-7 rounded-[6px] border text-[10px] capitalize",
                    field.imageFit === imageFit
                      ? "border-[#007AFF] text-[#007AFF]"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {imageFit}
                </button>
              ))}
            </div>
          </FieldRow>
        </>
      ) : null}

      {field.type === "richText" ? (
        <FieldRow label="Content">
          <RichTextEditor
            value={field.richText ?? ""}
            onChange={(richText) => updateField(field.id, { richText })}
            minHeight={180}
          />
        </FieldRow>
      ) : null}

      {isInput ? (
        <>
          <FieldRow label="Placeholder">
            <Input
              value={field.placeholder ?? ""}
              onChange={(event) =>
                updateField(field.id, { placeholder: event.target.value })
              }
            />
          </FieldRow>
          <FieldRow label="Help text">
            <Textarea
              value={field.helpText ?? ""}
              onChange={(event) => updateField(field.id, { helpText: event.target.value })}
              className="min-h-16"
            />
          </FieldRow>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-foreground">Required</span>
            <Switch
              checked={field.required}
              onCheckedChange={(required) => updateField(field.id, { required })}
            />
          </div>
          {hasOptions ? <OptionsEditor field={field} /> : null}

          {field.type === "text" ? (
            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="Min length">
                <Input
                  type="number"
                  min={0}
                  value={validation.minLength ?? ""}
                  onChange={(event) =>
                    updateField(field.id, {
                      validation: {
                        ...validation,
                        minLength: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      },
                    })
                  }
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
                        maxLength: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      },
                    })
                  }
                />
              </FieldRow>
            </div>
          ) : null}

          {field.type === "number" ? (
            <div className="grid grid-cols-2 gap-2">
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
                  updateField(field.id, {
                    maxRating: Number(event.target.value) || 5,
                  })
                }
              />
            </FieldRow>
          ) : null}

          {field.type === "file" ? (
            <FieldRow label="Accepted files">
              <Input
                value={field.accept ?? ""}
                onChange={(event) => updateField(field.id, { accept: event.target.value })}
              />
            </FieldRow>
          ) : null}
        </>
      ) : null}

      <StyleEditor field={field} />
    </PanelShell>
  );
}
