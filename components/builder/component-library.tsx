"use client";

import { useDraggable } from "@dnd-kit/core";
import { FIELD_GROUPS, FIELD_TYPE_META } from "@/lib/constants";
import { FIELD_TYPES, type FieldType } from "@/lib/types";
import { Icon } from "@/components/icon";
import { useBuilderStore } from "@/lib/store/builder-store";
import { cn } from "@/lib/utils";

function LibraryItem({ type }: { type: FieldType }) {
  const addField = useBuilderStore((state) => state.addField);
  const meta = FIELD_TYPE_META[type];
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:${type}`,
    data: { fromLibrary: true, type },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => addField(type)}
      className={cn(
        "flex w-full touch-none items-center gap-2 rounded-[9px] px-2 py-1.5 text-left transition-colors duration-150 hover:bg-white dark:hover:bg-white/5",
        isDragging && "opacity-30"
      )}
      {...listeners}
      {...attributes}
    >
      <span className="grid size-7 place-items-center rounded-[8px] bg-white text-[#007AFF] ring-1 ring-[#E5E5EA] dark:bg-white/10 dark:ring-white/10">
        <Icon icon={meta.icon} size={14} />
      </span>
      <span>
        <span className="block text-[12px] text-[#1D1D1F] dark:text-white">{meta.label}</span>
        <span className="block text-[11px] text-[#86868B]">{meta.description}</span>
      </span>
    </button>
  );
}

export function ComponentLibrary() {
  const form = useBuilderStore((state) => state.form);
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);
  const selectField = useBuilderStore((state) => state.selectField);
  const setDisplayMode = useBuilderStore((state) => state.setDisplayMode);

  return (
    <aside className="flex min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-[#E5E5EA] bg-[#FBFBFD] dark:border-white/10 dark:bg-[#161617]">
      <div className="px-3 py-3">
        <p className="text-[11px] font-medium text-[#86868B]">Fields</p>
        <h2 className="mt-0.5 text-[14px] font-semibold text-[#1D1D1F] dark:text-white">
          Component library
        </h2>
        <div className="mt-3 grid grid-cols-2 rounded-[9px] bg-[#EEEEF0] p-0.5 dark:bg-white/8">
          {(
            [
              ["conversational", "One at a time"],
              ["classic", "All at once"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDisplayMode(value)}
              className={cn(
                "h-7 rounded-[7px] px-2 text-[11px] transition-colors",
                form?.displayMode === value
                  ? "bg-white text-[#1D1D1F] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#2C2C2E] dark:text-white"
                  : "text-[#86868B]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-2 pb-3">
        {FIELD_GROUPS.map((group) => (
          <section key={group.id}>
            <p className="mb-0.5 px-2 text-[11px] text-[#86868B]">{group.label}</p>
            <div className="space-y-0.5">
              {FIELD_TYPES.filter((type) => FIELD_TYPE_META[type].group === group.id).map(
                (type) => (
                  <LibraryItem key={type} type={type} />
                )
              )}
            </div>
          </section>
        ))}
      </div>
      <div className="border-t border-[#E5E5EA] p-2 dark:border-white/10">
        <p className="mb-2 px-1 text-[12px] text-[#86868B]">
          Questions ({form?.fields.length ?? 0})
        </p>
        <div className="max-h-40 space-y-0.5 overflow-y-auto">
          {form?.fields.map((field, index) => (
            <button
              key={field.id}
              type="button"
              onClick={() => selectField(field.id)}
              className={cn(
                "flex w-full items-start gap-2 rounded-[9px] px-2 py-1.5 text-left transition-colors duration-150",
                selectedFieldId === field.id
                  ? "bg-white ring-1 ring-[#007AFF]/30 dark:bg-white/10"
                  : "hover:bg-white/80 dark:hover:bg-white/5"
              )}
            >
              <span className="mt-0.5 grid size-5 place-items-center rounded-md bg-[#F5F5F7] text-[11px] text-[#86868B] dark:bg-white/10">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] text-[#1D1D1F] dark:text-white">
                  {field.label || "Untitled"}
                </span>
                <span className="block text-[12px] text-[#86868B]">
                  {FIELD_TYPE_META[field.type].label}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
