"use client";

import { useDraggable } from "@dnd-kit/core";
import { FIELD_GROUPS, FIELD_TYPE_META } from "@/lib/constants";
import { FIELD_TYPES, type FieldType } from "@/lib/types";
import { Icon } from "@/components/icon";
import {
  LeftPanelTabs,
  type LeftPanelView,
} from "@/components/builder/left-panel-tabs";
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
        <span className="block text-[10px] text-muted-foreground">
          {meta.description}
        </span>
      </span>
    </button>
  );
}

export function ComponentLibrary({
  onViewChange,
}: {
  onViewChange: (view: LeftPanelView) => void;
}) {
  const form = useBuilderStore((state) => state.form);
  const setDisplayMode = useBuilderStore((state) => state.setDisplayMode);

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-border/80 bg-[#F4F4F2] shadow-[4px_0_18px_rgba(0,0,0,0.04)] dark:bg-[#171717] lg:shadow-none">
      <div className="space-y-3 border-b border-border/70 px-3 py-3">
        <LeftPanelTabs value="library" onChange={onViewChange} />
        <div>
          <p className="text-[10px] font-medium text-muted-foreground">Components</p>
          <h2 className="mt-0.5 text-[13px] font-semibold text-foreground">
            Insert a layer
          </h2>
        </div>
        <div className="grid grid-cols-2 rounded-[8px] bg-muted p-0.5">
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
                "h-7 rounded-[7px] px-2 text-[10px] transition-colors",
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
      <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
        {FIELD_GROUPS.map((group) => (
          <section key={group.id}>
            <p className="mb-0.5 px-2 text-[10px] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {FIELD_TYPES.filter(
                (type) => FIELD_TYPE_META[type].group === group.id
              ).map((type) => (
                <LibraryItem key={type} type={type} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
