"use client";

import { RestoreBinIcon } from "@hugeicons/core-free-icons";
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
import { useBuilderStore } from "@/lib/store/builder-store";
import { useFormsStore } from "@/lib/store/forms-store";
import { formatDateTime } from "@/lib/format";

export function VersionHistory({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useBuilderStore((state) => state.form);
  const replaceForm = useBuilderStore((state) => state.replaceForm);
  const saveVersion = useFormsStore((state) => state.saveVersion);
  const restoreVersion = useFormsStore((state) => state.restoreVersion);
  const forms = useFormsStore((state) => state.forms);
  const persisted = forms.find((item) => item.id === form?.id);
  const versions = persisted?.versions ?? form?.versions ?? [];

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>
            Snapshot this build, then restore it later if you need to roll back.
          </DialogDescription>
        </DialogHeader>
        <Button
          onClick={() => {
            const version = saveVersion(form.id);
            if (version) {
              replaceForm({ ...form, versions: [version, ...versions] });
              toast.success("Snapshot saved");
            }
          }}
          className="h-8 rounded-[8px] bg-[#007AFF] text-white hover:bg-[#0071E3]"
        >
          Save snapshot
        </Button>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {versions.length === 0 ? (
            <p className="rounded-xl bg-[#F5F5F7] px-3 py-4 text-[13px] text-[#86868B] dark:bg-white/5">
              No snapshots yet. Save one before making a risky change.
            </p>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between rounded-xl border border-[#E5E5EA] px-3 py-3 dark:border-white/10"
              >
                <div>
                  <p className="text-[13px] text-[#1D1D1F] dark:text-white">{version.label}</p>
                  <p className="text-[12px] text-[#86868B]">{formatDateTime(version.createdAt)}</p>
                </div>
                <Button
                  variant="outline"
                  className="h-8 rounded-[8px] text-[13px]"
                  onClick={() => {
                    const restored = restoreVersion(form.id, version.id);
                    if (restored) {
                      replaceForm(restored);
                      toast.success("Version restored");
                      onOpenChange(false);
                    }
                  }}
                >
                  <Icon icon={RestoreBinIcon} size={14} />
                  Restore
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
