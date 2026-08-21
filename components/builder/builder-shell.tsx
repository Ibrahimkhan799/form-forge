"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { FIELD_TYPE_META } from "@/lib/constants";
import type { FieldType } from "@/lib/types";
import { CanvasHeader } from "@/components/builder/canvas-header";
import { ComponentLibrary } from "@/components/builder/component-library";
import { LayersPanel } from "@/components/builder/layers-panel";
import type { LeftPanelView } from "@/components/builder/left-panel-tabs";
import { FormCanvas } from "@/components/builder/form-canvas";
import { InspectorPanel } from "@/components/builder/inspector-panel";
import { AppearancePanel } from "@/components/builder/theme-customizer";
import { FormPlayer } from "@/components/renderer/form-player";
import { Icon } from "@/components/icon";
import { useAutosave } from "@/hooks/use-autosave";
import { useBuilderShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useFormsStore } from "@/lib/store/forms-store";

function subscribeToDesktop(callback: () => void) {
  const query = window.matchMedia("(min-width: 1024px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getIsDesktop() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

export function BuilderShell({ formId }: { formId: string }) {
  const loadForm = useBuilderStore((state) => state.loadForm);
  const form = useBuilderStore((state) => state.form);
  const mode = useBuilderStore((state) => state.mode);
  const hasHydrated = useFormsStore((state) => state.hasHydrated);
  const persisted = useFormsStore((state) =>
    state.forms.find((item) => item.id === formId)
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const isDesktop = useSyncExternalStore(
    subscribeToDesktop,
    getIsDesktop,
    () => true
  );
  const [leftView, setLeftView] = useState<LeftPanelView>("library");
  const [rightView, setRightView] = useState<"inspector" | "appearance">(
    "inspector"
  );
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [mobilePanel, setMobilePanel] = useState<"left" | "right" | null>(null);

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

  const showLeft = isDesktop ? leftOpen : mobilePanel === "left";
  const showRight = isDesktop ? rightOpen : mobilePanel === "right";

  function toggleLeft() {
    if (isDesktop) setLeftOpen((value) => !value);
    else setMobilePanel((value) => (value === "left" ? null : "left"));
  }

  function toggleRight() {
    if (isDesktop) setRightOpen((value) => !value);
    else setMobilePanel((value) => (value === "right" ? null : "right"));
  }

  function openAppearance() {
    setRightView("appearance");
    if (isDesktop) setRightOpen(true);
    else setMobilePanel("right");
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveDragId(id);
    const activator = event.activatorEvent;
    if ("clientX" in activator && "clientY" in activator) {
      const origin = {
        x: Number(activator.clientX),
        y: Number(activator.clientY),
      };
      dragOrigin.current = origin;
      setDragPosition(origin);
    }
  }

  function handleDragMove(event: DragMoveEvent) {
    if (!dragOrigin.current) return;
    setDragPosition({
      x: dragOrigin.current.x + event.delta.x,
      y: dragOrigin.current.y + event.delta.y,
    });
  }

  function clearDragPreview() {
    setActiveDragId(null);
    setDragPosition(null);
    dragOrigin.current = null;
  }

  function handleDragEnd(event: DragEndEvent) {
    clearDragPreview();
    const { active, over } = event;
    if (!over || !form) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const overFieldId = overId.startsWith("layer:")
      ? overId.replace("layer:", "")
      : overId;

    if (activeId.startsWith("library:")) {
      const type = activeId.replace("library:", "") as FieldType;
      const overIndex = form.fields.findIndex((field) => field.id === overFieldId);
      useBuilderStore
        .getState()
        .addField(type, overIndex === -1 ? form.fields.length : overIndex);
      return;
    }

    const activeFieldId = activeId.startsWith("layer:")
      ? activeId.replace("layer:", "")
      : activeId;
    const from = form.fields.findIndex((field) => field.id === activeFieldId);
    const to = form.fields.findIndex((field) => field.id === overFieldId);
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
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={clearDragPreview}
    >
      <div className="fixed inset-0 flex h-dvh w-screen flex-col overflow-hidden bg-background">
        <CanvasHeader
          leftOpen={showLeft}
          rightOpen={showRight}
          onToggleLeft={toggleLeft}
          onToggleRight={toggleRight}
          onOpenAppearance={openAppearance}
          onEnterEdit={() => {
            if (isDesktop) setLeftOpen(true);
            else setMobilePanel(null);
          }}
          onEnterPreview={() => {
            setLeftOpen(false);
            setRightView("appearance");
            if (isDesktop) setRightOpen(true);
            else setMobilePanel("right");
          }}
        />
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {!isDesktop && mobilePanel ? (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setMobilePanel(null)}
              className="absolute inset-0 z-20 bg-black/15 backdrop-blur-[1px]"
            />
          ) : null}

          {showLeft ? (
            <div className="absolute inset-y-0 left-0 z-30 lg:static lg:z-auto">
              {leftView === "library" ? (
                <ComponentLibrary onViewChange={setLeftView} />
              ) : (
                <LayersPanel onViewChange={setLeftView} />
              )}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {mode === "preview" ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeInOut" }}
                className="min-h-0 min-w-0 flex-1 overflow-hidden"
              >
                <FormPlayer form={form} preview />
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeInOut" }}
                className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
              >
                <FormCanvas />
              </motion.div>
            )}
          </AnimatePresence>

          {showRight ? (
            <div className="absolute inset-y-0 right-0 z-30 lg:static lg:z-auto">
              {rightView === "appearance" ? (
                <AppearancePanel
                  onViewChange={setRightView}
                />
              ) : (
                <InspectorPanel onViewChange={setRightView} />
              )}
            </div>
          ) : null}
        </div>
      </div>
      {activeDragId && dragPosition ? (
        <div
          className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform"
          style={{
            transform: `translate3d(${dragPosition.x + 10}px, ${dragPosition.y + 10}px, 0)`,
          }}
          aria-hidden
        >
          <DragPreview
            type={
              activeDragId.startsWith("library:")
                ? (activeDragId.replace("library:", "") as FieldType)
                : form.fields.find(
                    (field) =>
                      field.id ===
                      (activeDragId.startsWith("layer:")
                        ? activeDragId.replace("layer:", "")
                        : activeDragId)
                  )?.type
            }
            label={
              activeDragId.startsWith("library:")
                ? undefined
                : form.fields.find(
                    (field) =>
                      field.id ===
                      (activeDragId.startsWith("layer:")
                        ? activeDragId.replace("layer:", "")
                        : activeDragId)
                  )?.label
            }
          />
        </div>
      ) : null}
    </DndContext>
  );
}

function DragPreview({ type, label }: { type?: FieldType; label?: string }) {
  if (!type) return null;

  return (
    <div className="flex max-w-60 items-center gap-2 rounded-[10px] border border-[#E5E5EA] bg-white px-2.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <span className="grid size-7 place-items-center rounded-[8px] bg-[#F5F5F7] text-[#007AFF]">
        <Icon icon={FIELD_TYPE_META[type].icon} size={14} />
      </span>
      <span className="min-w-0 truncate text-[12px] font-medium text-[#1D1D1F]">
        {label || FIELD_TYPE_META[type].label}
      </span>
    </div>
  );
}
