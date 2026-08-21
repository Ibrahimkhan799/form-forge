"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { FIELD_TYPE_META } from "@/lib/constants";
import type { FieldType } from "@/lib/types";
import { CanvasHeader } from "@/components/builder/canvas-header";
import { ComponentLibrary } from "@/components/builder/component-library";
import { FormCanvas } from "@/components/builder/form-canvas";
import { InspectorPanel } from "@/components/builder/inspector-panel";
import { FormPlayer } from "@/components/renderer/form-player";
import { Icon } from "@/components/icon";
import { useAutosave } from "@/hooks/use-autosave";
import { useBuilderShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useFormsStore } from "@/lib/store/forms-store";

export function BuilderShell({ formId }: { formId: string }) {
  const loadForm = useBuilderStore((state) => state.loadForm);
  const form = useBuilderStore((state) => state.form);
  const mode = useBuilderStore((state) => state.mode);
  const hasHydrated = useFormsStore((state) => state.hasHydrated);
  const persisted = useFormsStore((state) =>
    state.forms.find((item) => item.id === formId)
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  useAutosave();
  useBuilderShortcuts();

  useEffect(() => {
    if (!hasHydrated) return;
    const found = useFormsStore.getState().getForm(formId);
    if (!found) return;
    loadForm(found);
  }, [formId, hasHydrated, loadForm]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveDragId(id);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || !form) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("library:")) {
      const type = activeId.replace("library:", "") as FieldType;
      const overIndex = form.fields.findIndex((field) => field.id === overId);
      useBuilderStore
        .getState()
        .addField(type, overIndex === -1 ? form.fields.length : overIndex);
      return;
    }

    const from = form.fields.findIndex((field) => field.id === activeId);
    const to = form.fields.findIndex((field) => field.id === overId);
    if (from !== -1 && to !== -1 && from !== to) {
      useBuilderStore.getState().reorderFields(from, to);
    }
  }

  if (hasHydrated && !persisted) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FBFBFD] text-[#86868B]">
        This form could not be found.
      </div>
    );
  }

  if (!form || form.id !== formId) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FBFBFD] text-[#86868B]">
        Loading builder...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragId(null)}
    >
      <div className="fixed inset-0 flex h-dvh w-screen flex-col overflow-hidden bg-[#FBFBFD] dark:bg-black">
        <CanvasHeader />
        <AnimatePresence mode="wait">
          {mode === "preview" ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="min-h-0 flex-1 overflow-hidden"
            >
              <FormPlayer form={form} preview />
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="flex min-h-0 flex-1 overflow-hidden"
            >
              <ComponentLibrary />
              <FormCanvas />
              <InspectorPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <DragOverlay dropAnimation={null} zIndex={100}>
        {activeDragId ? (
          <DragPreview
            type={
              activeDragId.startsWith("library:")
                ? (activeDragId.replace("library:", "") as FieldType)
                : form.fields.find((field) => field.id === activeDragId)?.type
            }
            label={
              activeDragId.startsWith("library:")
                ? undefined
                : form.fields.find((field) => field.id === activeDragId)?.label
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DragPreview({ type, label }: { type?: FieldType; label?: string }) {
  if (!type) return null;

  return (
    <div className="flex w-72 rotate-[1deg] items-center gap-3 rounded-xl border border-[#007AFF]/40 bg-white px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
      <span className="grid size-8 place-items-center rounded-[9px] bg-[#F5F5F7] text-[#007AFF]">
        <Icon icon={FIELD_TYPE_META[type].icon} size={16} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-[#1D1D1F]">
          {label || FIELD_TYPE_META[type].label}
        </span>
        <span className="block text-[12px] text-[#86868B]">
          {FIELD_TYPE_META[type].description}
        </span>
      </span>
    </div>
  );
}
