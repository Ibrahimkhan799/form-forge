"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import { useStore } from "zustand";
import type { TemporalState } from "zundo";
import { createField } from "@/lib/constants";
import type {
  BuilderMode,
  FieldType,
  FormDocument,
  FormField,
  FormTheme,
  SaveStatus,
} from "@/lib/types";

interface BuilderState {
  form: FormDocument | null;
  selectedFieldId: string | null;
  mode: BuilderMode;
  saveStatus: SaveStatus;
  loadForm: (form: FormDocument) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPublished: (published: boolean) => void;
  addField: (type: FieldType, index?: number) => void;
  updateField: (id: string, patch: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  reorderFields: (from: number, to: number) => void;
  changeFieldType: (id: string, type: FieldType) => void;
  selectField: (id: string | null) => void;
  setMode: (mode: BuilderMode) => void;
  updateTheme: (patch: Partial<FormTheme>) => void;
  setSaveStatus: (status: SaveStatus) => void;
  replaceForm: (form: FormDocument) => void;
}

function touch(form: FormDocument) {
  form.updatedAt = new Date().toISOString();
}

export const useBuilderStore = create<BuilderState>()(
  temporal(
    immer((set) => ({
      form: null,
      selectedFieldId: null,
      mode: "edit",
      saveStatus: "saved",
      loadForm: (form) => {
        useBuilderStore.temporal.getState().pause();
        set((state) => {
          state.form = structuredClone(form);
          state.selectedFieldId = form.fields[0]?.id ?? null;
          state.mode = "edit";
          state.saveStatus = "saved";
        });
        useBuilderStore.temporal.getState().clear();
        useBuilderStore.temporal.getState().resume();
      },
      replaceForm: (form) => {
        set((state) => {
          state.form = structuredClone(form);
          if (
            state.selectedFieldId &&
            !form.fields.some((field) => field.id === state.selectedFieldId)
          ) {
            state.selectedFieldId = form.fields[0]?.id ?? null;
          }
        });
      },
      setTitle: (title) =>
        set((state) => {
          if (!state.form) return;
          state.form.title = title;
          touch(state.form);
        }),
      setDescription: (description) =>
        set((state) => {
          if (!state.form) return;
          state.form.description = description;
          touch(state.form);
        }),
      setPublished: (published) =>
        set((state) => {
          if (!state.form) return;
          state.form.published = published;
          touch(state.form);
        }),
      addField: (type, index) =>
        set((state) => {
          if (!state.form) return;
          const field = createField(type);
          const at = index ?? state.form.fields.length;
          state.form.fields.splice(at, 0, field);
          state.selectedFieldId = field.id;
          touch(state.form);
        }),
      updateField: (id, patch) =>
        set((state) => {
          if (!state.form) return;
          const field = state.form.fields.find((item) => item.id === id);
          if (!field) return;
          Object.assign(field, patch);
          touch(state.form);
        }),
      deleteField: (id) =>
        set((state) => {
          if (!state.form) return;
          const index = state.form.fields.findIndex((item) => item.id === id);
          if (index === -1) return;
          state.form.fields.splice(index, 1);
          if (state.selectedFieldId === id) {
            const next = state.form.fields[index] ?? state.form.fields[index - 1];
            state.selectedFieldId = next?.id ?? null;
          }
          touch(state.form);
        }),
      duplicateField: (id) =>
        set((state) => {
          if (!state.form) return;
          const index = state.form.fields.findIndex((item) => item.id === id);
          if (index === -1) return;
          const original = state.form.fields[index];
          const copy = structuredClone(original);
          copy.id = `${original.id}-copy-${Date.now().toString(36)}`;
          if (copy.options) {
            copy.options = copy.options.map((option) => ({
              ...option,
              id: `${option.id}-copy`,
            }));
          }
          state.form.fields.splice(index + 1, 0, copy);
          state.selectedFieldId = copy.id;
          touch(state.form);
        }),
      reorderFields: (from, to) =>
        set((state) => {
          if (!state.form) return;
          if (from === to) return;
          const [moved] = state.form.fields.splice(from, 1);
          state.form.fields.splice(to, 0, moved);
          touch(state.form);
        }),
      changeFieldType: (id, type) =>
        set((state) => {
          if (!state.form) return;
          const index = state.form.fields.findIndex((item) => item.id === id);
          if (index === -1) return;
          const previous = state.form.fields[index];
          const next = createField(type);
          next.id = previous.id;
          next.label = previous.label;
          next.helpText = previous.helpText;
          next.required = previous.required;
          next.placeholder = previous.placeholder;
          if (previous.options && next.options) next.options = previous.options;
          state.form.fields[index] = next;
          touch(state.form);
        }),
      selectField: (id) =>
        set((state) => {
          state.selectedFieldId = id;
        }),
      setMode: (mode) =>
        set((state) => {
          state.mode = mode;
        }),
      updateTheme: (patch) =>
        set((state) => {
          if (!state.form) return;
          Object.assign(state.form.theme, patch);
          touch(state.form);
        }),
      setSaveStatus: (status) =>
        set((state) => {
          state.saveStatus = status;
        }),
    })),
    {
      limit: 50,
      partialize: (state) => ({ form: state.form }),
      equality: (past, current) =>
        JSON.stringify(past.form) === JSON.stringify(current.form),
    }
  )
);

type TrackedState = Pick<BuilderState, "form">;

export function useBuilderTemporal<T>(
  selector: (state: TemporalState<TrackedState>) => T
) {
  return useStore(useBuilderStore.temporal, selector);
}

export function useSelectedField() {
  return useBuilderStore((state) => {
    if (!state.form || !state.selectedFieldId) return null;
    return state.form.fields.find((field) => field.id === state.selectedFieldId) ?? null;
  });
}
