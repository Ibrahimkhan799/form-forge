"use client";

import { useMemo, useState } from "react";
import { CheckmarkCircle02Icon, Copy01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useFormsStore } from "@/lib/store/forms-store";

export function ShareDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useBuilderStore((state) => state.form);
  const setPublished = useBuilderStore((state) => state.setPublished);
  const upsertForm = useFormsStore((state) => state.upsertForm);
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    if (!form || typeof window === "undefined") return "";
    return `${window.location.origin}/f/${form.id}`;
  }, [form]);

  if (!form) return null;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share and publish</DialogTitle>
          <DialogDescription>
            Publishing makes this form available at a public link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between rounded-xl bg-[#F5F5F7] px-3 py-3 dark:bg-white/5">
          <div>
            <p className="text-[13px] text-[#1D1D1F] dark:text-white">Published</p>
            <p className="text-[12px] text-[#86868B]">Anyone with the link can respond</p>
          </div>
          <Switch
            checked={form.published}
            onCheckedChange={(checked) => {
              setPublished(checked);
              upsertForm({ ...form, published: checked, updatedAt: new Date().toISOString() });
              toast.success(checked ? "Form published" : "Form unpublished");
            }}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Icon
              icon={Link01Icon}
              size={14}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#86868B]"
            />
            <Input readOnly value={url} className="h-9 rounded-xl pl-9 text-[13px]" />
          </div>
          <Button onClick={copyLink} className="h-9 rounded-[8px] bg-[#007AFF] text-white hover:bg-[#0071E3]">
            <Icon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} size={14} />
            Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
