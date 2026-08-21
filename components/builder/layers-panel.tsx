"use client";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragDropVerticalIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { CONFIRMATION_ID, FIELD_TYPE_META } from "@/lib/constants";
import type { FormField } from "@/lib/types";
import { Icon } from "@/components/icon";
import {
  LeftPanelTabs,
  type LeftPanelView,
} from "@/components/builder/left-panel-tabs";
import { useBuilderStore } from "@/lib/store/builder-store";
import { cn } from "@/lib/utils";

function LayerRow({
  field,
  index,
  selected,
  onSelect,
}: {
  field: FormField;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `layer:${field.id}` });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center rounded-[7px] pr-1 transition-colors",
        selected ? "bg-card ring-1 ring-[#007AFF]/25" : "hover:bg-card/80",
        isDragging && "opacity-25"
      )}
    >
      <button
        type="button"
        aria-label={`Reorder ${field.label}`}
        className="grid size-7 touch-none cursor-grab place-items-center text-muted-foreground/45 hover:text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <Icon icon={DragDropVerticalIcon} size={12} />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
      >
        <span className="grid size-5 place-items-center rounded-[5px] bg-muted text-[9px] text-muted-foreground">
          {index + 1}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[11px] text-foreground">
            {field.label || "Untitled"}
          </span>
          <span className="block text-[9px] text-muted-foreground">
            {FIELD_TYPE_META[field.type].label}
          </span>
        </span>
      </button>
    </div>
  );
}

export function LayersPanel({
  onViewChange,
}: {
  onViewChange: (view: LeftPanelView) => void;
}) {
  const form = useBuilderStore((state) => state.form);
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);
  const selectField = useBuilderStore((state) => state.selectField);
  const fields = form?.fields ?? [];

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-border/80 bg-[#F4F4F2] shadow-[4px_0_18px_rgba(0,0,0,0.04)] dark:bg-[#171717] lg:shadow-none">
      <div className="space-y-3 border-b border-border/70 px-3 py-3">
        <LeftPanelTabs value="layers" onChange={onViewChange} />
        <div>
          <p className="text-[10px] font-medium text-muted-foreground">Structure</p>
          <h2 className="mt-0.5 text-[13px] font-semibold text-foreground">
            Layers · {fields.length + 1}
          </h2>
        </div>
      </div>
      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
        <SortableContext
          items={fields.map((field) => `layer:${field.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, index) => (
            <LayerRow
              key={field.id}
              field={field}
              index={index}
              selected={selectedFieldId === field.id}
              onSelect={() => selectField(field.id)}
            />
          ))}
        </SortableContext>
        <button
          type="button"
          onClick={() => selectField(CONFIRMATION_ID)}
          className={cn(
            "flex w-full items-center gap-2 rounded-[7px] px-1 py-1.5 text-left",
            selectedFieldId === CONFIRMATION_ID
              ? "bg-card ring-1 ring-[#007AFF]/25"
              : "hover:bg-card/80"
          )}
        >
          <span className="grid size-7 place-items-center text-[#34C759]">
            <Icon icon={Tick02Icon} size={12} />
          </span>
          <span>
            <span className="block text-[11px] text-foreground">Confirmation</span>
            <span className="block text-[9px] text-muted-foreground">System layer</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
