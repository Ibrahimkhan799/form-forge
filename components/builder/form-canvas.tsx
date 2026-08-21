"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { FieldCard } from "@/components/builder/field-card";
import { Icon } from "@/components/icon";
import { Textarea } from "@/components/ui/textarea";
import { useBuilderStore } from "@/lib/store/builder-store";

export function FormCanvas() {
  const form = useBuilderStore((state) => state.form);
  const setDescription = useBuilderStore((state) => state.setDescription);
  const addField = useBuilderStore((state) => state.addField);
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop" });

  if (!form) return null;

  return (
    <div
      ref={setNodeRef}
      className="canvas-dots min-h-0 flex-1 overflow-y-auto"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-8">
        <div className="rounded-xl border border-[#E5E5EA] bg-white p-5 dark:border-white/10 dark:bg-[#1C1C1E]">
          <p className="text-[13px] text-[#86868B]">Form description</p>
          <Textarea
            value={form.description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Tell people what this form is for"
            className="mt-2 min-h-20 border-transparent bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0"
          />
        </div>

        <SortableContext
          items={form.fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-4">
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
                : "border-[#D2D2D7] bg-white/70 dark:bg-white/5"
            }`}
          >
            <p className="text-[15px] text-[#1D1D1F] dark:text-white">Drop a field here</p>
            <p className="mt-1 text-[13px] text-[#86868B]">
              Or click a component in the library to add it
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => addField("text")}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-[#D2D2D7] text-[13px] text-[#86868B] transition-colors duration-150 hover:border-[#007AFF] hover:text-[#007AFF]"
        >
          <Icon icon={PlusSignIcon} size={16} />
          Add question
        </button>
      </div>
    </div>
  );
}
