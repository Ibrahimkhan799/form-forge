"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
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
    <motion.div
      layout
      transition={{ duration: 0.18, ease: "easeInOut" }}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => selectField(field.id)}
      className={cn(
        "group rounded-xl border bg-white p-4 transition-all duration-150 dark:bg-[#1C1C1E]",
        selected
          ? "border-[#007AFF] shadow-[0_8px_30px_rgba(0,122,255,0.08)]"
          : "border-[#E5E5EA] hover:border-[#C7C7CC] dark:border-white/10",
        isDragging && "opacity-60"
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          className="grid size-7 cursor-grab place-items-center rounded-[8px] text-[#C7C7CC] hover:bg-[#F5F5F7] hover:text-[#86868B] active:cursor-grabbing"
          aria-label={`Reorder question ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <Icon icon={DragDropVerticalIcon} size={16} />
        </button>
        <Select
          value={field.type}
          onValueChange={(value) => {
            if (value) changeFieldType(field.id, value as FormField["type"]);
          }}
        >
          <SelectTrigger className="h-7 min-w-40 rounded-[8px] border-[#E5E5EA] text-[13px]">
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
          <span className="text-[13px] text-[#86868B]">Required</span>
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
                  className="size-7 rounded-[8px] text-[#86868B]"
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
        className="mb-3 h-10 border-transparent bg-transparent px-0 text-[17px] font-medium shadow-none focus-visible:border-transparent focus-visible:ring-0"
      />
      {field.helpText ? (
        <p className="mb-3 text-[13px] text-[#86868B]">{field.helpText}</p>
      ) : null}
      <FieldPreview field={field} />
    </motion.div>
  );
}
