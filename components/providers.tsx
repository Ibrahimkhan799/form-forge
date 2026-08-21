"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useFormsStore } from "@/lib/store/forms-store";
import { useSubmissionsStore } from "@/lib/store/submissions-store";

function PersistHydration() {
  useEffect(() => {
    const finishForms = () => useFormsStore.getState().setHasHydrated(true);
    const finishSubmissions = () => useSubmissionsStore.getState().setHasHydrated(true);

    const unsubForms = useFormsStore.persist.onFinishHydration(finishForms);
    const unsubSubmissions = useSubmissionsStore.persist.onFinishHydration(finishSubmissions);

    if (useFormsStore.persist.hasHydrated()) finishForms();
    if (useSubmissionsStore.persist.hasHydrated()) finishSubmissions();

    return () => {
      unsubForms();
      unsubSubmissions();
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider delay={200}>
        <PersistHydration />
        {children}
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
