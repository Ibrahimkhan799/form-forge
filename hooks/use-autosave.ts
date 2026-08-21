"use client";

import { useEffect, useRef } from "react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useFormsStore } from "@/lib/store/forms-store";
import { normalizeFormDocument } from "@/lib/constants";
import { persistForm } from "@/lib/supabase/repository";

export function useAutosave(delay = 500) {
  const form = useBuilderStore((state) => state.form);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFirst = useRef(true);

  useEffect(() => {
    if (!form) return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    useBuilderStore.getState().setSaveStatus("unsaved");
    const existing = useFormsStore.getState().getForm(form.id);
    const localForm = normalizeFormDocument({
      ...form,
      versions: existing?.versions ?? form.versions,
    });
    useFormsStore.setState((state) => {
      const index = state.forms.findIndex((item) => item.id === localForm.id);
      if (index === -1) return { forms: [localForm, ...state.forms] };
      const forms = [...state.forms];
      forms[index] = localForm;
      return { forms };
    });

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      useBuilderStore.getState().setSaveStatus("saving");
      void persistForm(localForm)
        .catch(() => undefined)
        .finally(() => {
          window.setTimeout(() => {
            useBuilderStore.getState().setSaveStatus("saved");
          }, 180);
        });
    }, delay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [form, delay]);
}
