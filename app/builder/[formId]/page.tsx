"use client";

import { BuilderShell } from "@/components/builder/builder-shell";
import { use } from "react";

export default function BuilderPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  return <BuilderShell formId={formId} />;
}
