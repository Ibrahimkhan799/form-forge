"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  cloneSnapshot,
  createBlankForm,
  createDemoForm,
  normalizeFormDocument,
} from "@/lib/constants";
import { createId } from "@/lib/id";
import type { FormDocument, FormVersion } from "@/lib/types";

interface FormsState {
  forms: FormDocument[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  getForm: (id: string) => FormDocument | undefined;
  createForm: (title?: string) => FormDocument;
  upsertForm: (form: FormDocument) => void;
  deleteForm: (id: string) => void;
  duplicateForm: (id: string) => FormDocument | undefined;
  saveVersion: (id: string, label?: string) => FormVersion | undefined;
  restoreVersion: (id: string, versionId: string) => FormDocument | undefined;
}

export const useFormsStore = create<FormsState>()(
  persist(
    (set, get) => ({
      forms: [createDemoForm()],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      getForm: (id) => {
        const form = get().forms.find((item) => item.id === id);
        return form ? normalizeFormDocument(form) : undefined;
      },
      createForm: (title) => {
        const form = createBlankForm(title);
        set((state) => ({ forms: [form, ...state.forms] }));
        return form;
      },
      upsertForm: (form) =>
        set((state) => {
          const normalized = normalizeFormDocument(form);
          const index = state.forms.findIndex((item) => item.id === form.id);
          if (index === -1) return { forms: [normalized, ...state.forms] };
          const next = [...state.forms];
          next[index] = normalized;
          return { forms: next };
        }),
      deleteForm: (id) => {
        set((state) => ({
          forms: state.forms.filter((form) => form.id !== id),
        }));
      },
      duplicateForm: (id) => {
        const original = get().getForm(id);
        if (!original) return undefined;
        const copy: FormDocument = {
          ...structuredClone(original),
          id: createId(10),
          title: `${original.title} copy`,
          published: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          versions: [],
        };
        set((state) => ({ forms: [copy, ...state.forms] }));
        return copy;
      },
      saveVersion: (id, label) => {
        const form = get().getForm(id);
        if (!form) return undefined;
        const version: FormVersion = {
          id: createId(8),
          createdAt: new Date().toISOString(),
          label: label || `Version ${form.versions.length + 1}`,
          snapshot: cloneSnapshot(form),
        };
        get().upsertForm({ ...form, versions: [version, ...form.versions] });
        return version;
      },
      restoreVersion: (id, versionId) => {
        const form = get().getForm(id);
        if (!form) return undefined;
        const version = form.versions.find((item) => item.id === versionId);
        if (!version) return undefined;
        const restored: FormDocument = {
          ...form,
          ...structuredClone(version.snapshot),
          updatedAt: new Date().toISOString(),
        };
        get().upsertForm(restored);
        return restored;
      },
    }),
    {
      name: "formforge:forms",
      version: 2,
      partialize: (state) => ({ forms: state.forms }),
      migrate: (persistedState) => {
        const persisted = persistedState as { forms?: FormDocument[] };
        return {
          ...persisted,
          forms: (persisted.forms ?? []).map(normalizeFormDocument),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
