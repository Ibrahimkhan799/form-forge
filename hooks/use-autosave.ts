"use client";

import { useEffect, useRef } from "react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useFormsStore } from "@/lib/store/forms-store";

export function useAutosave(delay = 800) {
  const form = useBuilderStore((state) => state.form);
  const upsertForm = useFormsStore((state) => state.upsertForm);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFirst = useRef(true);

  useEffect(() => {
    if (!form) return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    useBuilderStore.getState().setSaveStatus("unsaved");
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      useBuilderStore.getState().setSaveStatus("saving");
      const current = useBuilderStore.getState().form;
      if (current) {
        const existing = useFormsStore.getState().getForm(current.id);
        upsertForm({
          ...current,
          versions: existing?.versions ?? current.versions,
        });
      }
      window.setTimeout(() => {
        useBuilderStore.getState().setSaveStatus("saved");
      }, 280);
    }, delay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [form, delay, upsertForm]);
}
