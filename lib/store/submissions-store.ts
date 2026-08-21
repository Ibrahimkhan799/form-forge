"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "@/lib/id";
import { DEMO_FORM_ID } from "@/lib/constants";
import type { FormSubmission, FormVisit } from "@/lib/types";

interface SubmissionsState {
  submissions: FormSubmission[];
  visits: FormVisit[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  recordVisit: (formId: string) => void;
  addSubmission: (formId: string, data: Record<string, unknown>) => FormSubmission;
  getSubmissions: (formId: string) => FormSubmission[];
  getVisits: (formId: string) => FormVisit[];
  deleteSubmission: (id: string) => void;
}

function daysAgo(days: number, hour = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 10, 0, 0);
  return date.toISOString();
}

function seedDemoSubmissions(): { submissions: FormSubmission[]; visits: FormVisit[] } {
  const names = ["Ava Chen", "Marcus Cole", "Priya Shah", "Jonah Lee", "Elena Ruiz"];
  const roles = ["Product designer", "Engineer", "Founder", "Engineer", "Something else"];
  const tools = [
    ["Typeform", "Figma"],
    ["Google Forms", "Notion"],
    ["Webflow", "Notion"],
    ["Typeform"],
    ["Google Forms", "Webflow"],
  ];
  const submissions: FormSubmission[] = names.map((name, index) => ({
    id: `demo-sub-${index + 1}`,
    formId: DEMO_FORM_ID,
    completed: true,
    submittedAt: daysAgo(8 - index, 9 + index),
    data: {
      name,
      email: `${name.toLowerCase().replace(" ", ".")}@studio.dev`,
      role: roles[index],
      tools: tools[index],
      rating: 4 + (index % 2),
      "follow-up": daysAgo(2 - (index % 3)).slice(0, 10),
    },
  }));

  const visits: FormVisit[] = [
    ...submissions.map((submission, index) => ({
      id: `demo-visit-${index + 1}`,
      formId: DEMO_FORM_ID,
      visitedAt: daysAgo(8 - index, 8 + index),
    })),
    { id: "demo-visit-abandon-1", formId: DEMO_FORM_ID, visitedAt: daysAgo(3, 16) },
    { id: "demo-visit-abandon-2", formId: DEMO_FORM_ID, visitedAt: daysAgo(1, 11) },
  ];

  return { submissions, visits };
}

const seeded = seedDemoSubmissions();

export const useSubmissionsStore = create<SubmissionsState>()(
  persist(
    (set, get) => ({
      submissions: seeded.submissions,
      visits: seeded.visits,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      recordVisit: (formId) =>
        set((state) => ({
          visits: [
            ...state.visits,
            { id: createId(10), formId, visitedAt: new Date().toISOString() },
          ],
        })),
      addSubmission: (formId, data) => {
        const submission: FormSubmission = {
          id: createId(12),
          formId,
          data,
          submittedAt: new Date().toISOString(),
          completed: true,
        };
        set((state) => ({ submissions: [submission, ...state.submissions] }));
        return submission;
      },
      getSubmissions: (formId) =>
        get().submissions.filter((item) => item.formId === formId),
      getVisits: (formId) => get().visits.filter((item) => item.formId === formId),
      deleteSubmission: (id) =>
        set((state) => ({
          submissions: state.submissions.filter((item) => item.id !== id),
        })),
    }),
    {
      name: "formforge:submissions",
      partialize: (state) => ({
        submissions: state.submissions,
        visits: state.visits,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
