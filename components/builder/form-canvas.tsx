"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PlusSignIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { FieldCard } from "@/components/builder/field-card";
import { Icon } from "@/components/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONFIRMATION_ID } from "@/lib/constants";
import { useBuilderStore } from "@/lib/store/builder-store";
import { cn } from "@/lib/utils";

export function FormCanvas() {
  const form = useBuilderStore((state) => state.form);
  const setDescription = useBuilderStore((state) => state.setDescription);
  const addField = useBuilderStore((state) => state.addField);
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);
  const selectField = useBuilderStore((state) => state.selectField);
  const updateConfirmation = useBuilderStore((state) => state.updateConfirmation);
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop" });

  if (!form) return null;

  return (
    <div
      ref={setNodeRef}
      className="builder-canvas canvas-dots h-full min-h-0 flex-1 overflow-y-auto overscroll-contain"
    >
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-3 px-4 py-4 pb-8">
        <div className="rounded-[10px] border border-border/90 bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Form description</p>
          <Textarea
            value={form.description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Tell people what this form is for"
            className="mt-1 min-h-14 border-transparent bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0"
          />
        </div>

        <SortableContext
          items={form.fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {form.fields.map((field, index) => (
              <FieldCard key={field.id} field={field} index={index} />
            ))}
          </div>
        </SortableContext>

        {form.fields.length === 0 || isOver ? (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors duration-150 ${
              isOver
                ? "border-[#007AFF] bg-[rgba(0,122,255,0.06)]"
                : "border-border bg-card/70"
            }`}
          >
            <p className="text-[13px] text-foreground">Drop a field here</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Or click a component in the library to add it
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => addField("text")}
          className="flex h-9 items-center justify-center gap-2 rounded-[8px] border border-dashed border-border text-[11px] text-muted-foreground transition-colors duration-150 hover:border-[#007AFF]/60 hover:text-[#007AFF]"
        >
          <Icon icon={PlusSignIcon} size={16} />
          Add question
        </button>

        <div
          role="button"
          tabIndex={0}
          onClick={() => selectField(CONFIRMATION_ID)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              selectField(CONFIRMATION_ID);
            }
          }}
          className={cn(
            "mt-1 rounded-[10px] border bg-card p-4 text-left transition-colors",
            selectedFieldId === CONFIRMATION_ID
              ? "border-[#007AFF]"
              : "border-border/90 hover:border-foreground/20"
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-[#34C759] text-white">
              <Icon icon={Tick02Icon} size={15} />
            </span>
            <div>
              <p className="text-[12px] font-medium text-foreground">
                Confirmation
              </p>
              <p className="text-[10px] text-muted-foreground">Shown after submission</p>
            </div>
          </div>
          <Input
            value={form.confirmation.title}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => updateConfirmation({ title: event.target.value })}
            className="h-10 border-transparent bg-[#F5F5F7] px-4 text-[15px] font-medium shadow-none focus-visible:border-[#007AFF] dark:bg-white/6"
          />
          <Textarea
            value={form.confirmation.message}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => updateConfirmation({ message: event.target.value })}
            className="mt-2 min-h-16 border-transparent bg-[#F5F5F7] px-4 text-[13px] shadow-none focus-visible:border-[#007AFF] dark:bg-white/6"
          />
        </div>
      </div>
    </div>
  );
}
