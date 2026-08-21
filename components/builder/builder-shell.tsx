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
  const [activeType, setActiveType] = useState<FieldType | null>(null);

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
    if (id.startsWith("library:")) {
      setActiveType(id.replace("library:", "") as FieldType);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveType(null);
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
      onDragCancel={() => setActiveType(null)}
    >
      <div className="flex h-screen flex-col overflow-hidden bg-[#FBFBFD] dark:bg-black">
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
              className="flex min-h-0 flex-1"
            >
              <ComponentLibrary />
              <FormCanvas />
              <InspectorPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <DragOverlay>
        {activeType ? (
          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5EA] bg-white px-3 py-2 shadow-sm">
            <span className="grid size-8 place-items-center rounded-[10px] bg-[#F5F5F7] text-[#007AFF]">
              <Icon icon={FIELD_TYPE_META[activeType].icon} size={16} />
            </span>
            <span className="text-[13px] text-[#1D1D1F]">
              {FIELD_TYPE_META[activeType].label}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
