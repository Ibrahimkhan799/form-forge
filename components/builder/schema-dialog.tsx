"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formToJsonSchema, parseJsonSchema, jsonSchemaToFields } from "@/lib/schema/json-schema";
import { useBuilderStore } from "@/lib/store/builder-store";
import { downloadTextFile } from "@/lib/format";

export function SchemaDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useBuilderStore((state) => state.form);
  const replaceForm = useBuilderStore((state) => state.replaceForm);
  const schema = useMemo(() => (form ? formToJsonSchema(form) : null), [form]);
  const [draft, setDraft] = useState("");

  if (!form || !schema) return null;

  const text = JSON.stringify(schema, null, 2);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) setDraft(text);
      }}
    >
      <DialogContent className="grid h-[min(720px,calc(100dvh-32px))] max-h-[calc(100dvh-32px)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl p-5 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>JSON schema</DialogTitle>
          <DialogDescription>
            Export this form as JSON Schema, or import a schema to rebuild the fields.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={draft || text}
          onChange={(event) => setDraft(event.target.value)}
          className="field-sizing-fixed h-full min-h-0 resize-none overflow-auto rounded-xl px-4 py-3 font-mono text-[12px]"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="h-8 rounded-[8px]"
            onClick={() => downloadTextFile(`${form.title || "form"}.schema.json`, text, "application/json")}
          >
            Download
          </Button>
          <Button
            className="h-8 rounded-[8px] bg-[#007AFF] text-white hover:bg-[#0071E3]"
            onClick={() => {
              try {
                const parsed = parseJsonSchema(draft || text);
                const imported = jsonSchemaToFields(parsed);
                replaceForm({
                  ...form,
                  title: imported.title || form.title,
                  description: imported.description,
                  fields: imported.fields,
                  theme: parsed["x-formforge"]?.theme ?? form.theme,
                  displayMode:
                    parsed["x-formforge"]?.displayMode ?? form.displayMode,
                  confirmation:
                    parsed["x-formforge"]?.confirmation ?? form.confirmation,
                  updatedAt: new Date().toISOString(),
                });
                toast.success("Schema imported");
                onOpenChange(false);
              } catch {
                toast.error("Could not parse that JSON schema");
              }
            }}
          >
            Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
