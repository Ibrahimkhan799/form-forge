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
        "flex w-full touch-none items-center gap-2 rounded-[7px] px-2 py-1.5 text-left transition-colors duration-150 hover:bg-card",
        isDragging && "opacity-30"
      )}
      {...listeners}
      {...attributes}
    >
      <span className="grid size-7 place-items-center rounded-[7px] bg-card text-[#007AFF] ring-1 ring-border/80">
        <Icon icon={meta.icon} size={14} />
      </span>
      <span>
        <span className="block text-[12px] text-foreground">{meta.label}</span>
        <span className="block text-[11px] text-muted-foreground">{meta.description}</span>
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
    <aside className="flex min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-border/80 bg-[#F4F4F2] dark:bg-[#171717]">
      <div className="px-3 py-3">
        <p className="text-[11px] font-medium text-muted-foreground">Fields</p>
        <h2 className="mt-0.5 text-[14px] font-semibold text-foreground">
          Component library
        </h2>
        <div className="mt-3 grid grid-cols-2 rounded-[8px] bg-muted p-0.5">
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
                  ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-muted-foreground"
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
            <p className="mb-0.5 px-2 text-[11px] text-muted-foreground">{group.label}</p>
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
      <div className="border-t border-border/80 p-2">
        <p className="mb-2 px-1 text-[11px] text-muted-foreground">
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
                  ? "bg-card ring-1 ring-[#007AFF]/25"
                  : "hover:bg-card/80"
              )}
            >
              <span className="mt-0.5 grid size-5 place-items-center rounded-[5px] bg-muted text-[10px] text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] text-foreground">
                  {field.label || "Untitled"}
                </span>
                <span className="block text-[10px] text-muted-foreground">
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
