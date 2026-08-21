"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Copy01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { FIELD_TYPE_META } from "@/lib/constants";
import { FIELD_TYPES, type FormField } from "@/lib/types";
import { Icon } from "@/components/icon";
import { FieldPreview } from "@/components/fields/field-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBuilderStore } from "@/lib/store/builder-store";
import { cn } from "@/lib/utils";

export function FieldCard({ field, index }: { field: FormField; index: number }) {
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);
  const selectField = useBuilderStore((state) => state.selectField);
  const updateField = useBuilderStore((state) => state.updateField);
  const deleteField = useBuilderStore((state) => state.deleteField);
  const duplicateField = useBuilderStore((state) => state.duplicateField);
  const changeFieldType = useBuilderStore((state) => state.changeFieldType);
  const selected = selectedFieldId === field.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => selectField(field.id)}
      className={cn(
        "group relative rounded-[10px] border bg-card p-3 will-change-transform",
        selected
          ? "border-[#007AFF]"
          : "border-border/90 transition-colors duration-150 hover:border-foreground/20",
        isDragging && "z-10 opacity-0"
      )}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <button
          type="button"
          className="grid size-6 touch-none cursor-grab place-items-center rounded-[6px] text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground active:cursor-grabbing"
          aria-label={`Reorder question ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <Icon icon={DragDropVerticalIcon} size={14} />
        </button>
        <Select
          value={field.type}
          onValueChange={(value) => {
            if (value) changeFieldType(field.id, value as FormField["type"]);
          }}
        >
          <SelectTrigger className="h-7 min-w-32 text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {FIELD_TYPE_META[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Required</span>
          <Switch
            checked={field.required}
            onCheckedChange={(checked) => updateField(field.id, { required: checked })}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground"
                />
              }
            >
              <Icon icon={MoreHorizontalIcon} size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => duplicateField(field.id)}>
                <Icon icon={Copy01Icon} size={14} />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => deleteField(field.id)}
              >
                <Icon icon={Delete02Icon} size={14} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Input
        value={field.label}
        onChange={(event) => updateField(field.id, { label: event.target.value })}
        placeholder="Question"
        className="mb-2 h-8 border-transparent bg-transparent px-0 text-[15px] font-medium shadow-none focus-visible:border-transparent focus-visible:ring-0"
      />
      {field.helpText ? (
        <p className="mb-2 text-[11px] text-muted-foreground">{field.helpText}</p>
      ) : null}
      <FieldPreview field={field} />
    </div>
  );
}
