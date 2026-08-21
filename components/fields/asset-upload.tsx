"use client";

import { useState } from "react";
import {
  ImageUpload01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import type { StoredAssetRef } from "@/lib/types";
import { storeUpload } from "@/lib/upload-store";

export function AssetUpload({
  value,
  accept = "image/*",
  onChange,
}: {
  value?: StoredAssetRef;
  accept?: string;
  onChange: (asset: StoredAssetRef) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Maximum file size is 10 MB");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      onChange(await storeUpload(file));
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-[7px] border border-dashed border-border px-2.5 py-2 transition-colors hover:border-[#007AFF]/50 hover:bg-[#007AFF]/[0.03]">
        <Icon
          icon={uploading ? Loading03Icon : ImageUpload01Icon}
          size={14}
          className={uploading ? "animate-spin text-[#007AFF]" : "text-muted-foreground"}
        />
        <span className="min-w-0">
          <span className="block truncate text-[10px] text-foreground">
            {uploading ? "Uploading…" : value?.name || "Upload image"}
          </span>
          <span className="block text-[9px] text-muted-foreground">
            {error || "Stored locally · max 10 MB"}
          </span>
        </span>
        <input
          type="file"
          accept={accept}
          disabled={uploading}
          className="sr-only"
          onChange={(event) => upload(event.target.files?.[0])}
        />
      </label>
    </div>
  );
}
