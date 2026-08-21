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
      <DialogContent className="max-w-lg p-4 sm:max-w-lg">
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
          className="h-8"
        >
          Save snapshot
        </Button>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {versions.length === 0 ? (
            <p className="rounded-[8px] bg-muted px-3 py-3 text-[11px] text-muted-foreground">
              No snapshots yet. Save one before making a risky change.
            </p>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between rounded-[8px] border border-border px-3 py-2.5"
              >
                <div>
                  <p className="text-[11px] text-foreground">{version.label}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDateTime(version.createdAt)}</p>
                </div>
                <Button
                  variant="outline"
                  className="h-7 text-[10px]"
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
