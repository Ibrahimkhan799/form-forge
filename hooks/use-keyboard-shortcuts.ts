"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/lib/store/builder-store";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function useBuilderShortcuts() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey;
      const temporal = useBuilderStore.temporal.getState();

      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) temporal.redo();
        else temporal.undo();
        return;
      }

      if (meta && event.key.toLowerCase() === "y") {
        event.preventDefault();
        temporal.redo();
        return;
      }

      if (event.key === "Escape") {
        useBuilderStore.getState().selectField(null);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        !isEditableTarget(event.target)
      ) {
        const selected = useBuilderStore.getState().selectedFieldId;
        if (selected) {
          event.preventDefault();
          useBuilderStore.getState().deleteField(selected);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
