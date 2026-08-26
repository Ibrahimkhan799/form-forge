"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { FormPlayer } from "@/components/renderer/form-player";
import { useFormsStore } from "@/lib/store/forms-store";

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const hasHydrated = useFormsStore((state) => state.hasHydrated);
  const form = useFormsStore((state) => state.forms.find((item) => item.id === formId));
  const loadPublishedForm = useFormsStore((state) => state.loadPublishedForm);
  const [remoteChecked, setRemoteChecked] = useState(false);

  useEffect(() => {
    if (!hasHydrated || form) return;
    let active = true;
    loadPublishedForm(formId).finally(() => {
      if (active) setRemoteChecked(true);
    });
    return () => {
      active = false;
    };
  }, [form, formId, hasHydrated, loadPublishedForm]);

  if (!hasHydrated || (!form && !remoteChecked)) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FBFBFD] text-[#86868B]">
        Loading form...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FBFBFD] px-6 text-center">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1D1D1F]">Form not found</h1>
          <p className="mt-2 text-[15px] text-[#86868B]">
            This form does not exist in this browser yet.
          </p>
          <Link href="/" className="mt-4 inline-block text-[13px] text-[#007AFF]">
            Back to FormForge
          </Link>
        </div>
      </div>
    );
  }

  if (!form.published) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FBFBFD] px-6 text-center">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1D1D1F]">This form is not published</h1>
          <p className="mt-2 text-[15px] text-[#86868B]">
            Ask the owner to publish it from the builder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <FormPlayer form={form} />
    </div>
  );
}
