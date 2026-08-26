"use client";

import { useEffect, useState } from "react";
import type { StoredAssetRef } from "@/lib/types";
import { getStoredUpload } from "@/lib/upload-store";

export function useAssetUrl(asset?: StoredAssetRef) {
  const [state, setState] = useState<{
    url?: string;
    loading: boolean;
    error?: string;
  }>({ loading: Boolean(asset) });

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;

    if (!asset) {
      const frame = requestAnimationFrame(() => setState({ loading: false }));
      return () => cancelAnimationFrame(frame);
    }

    if (asset.url) {
      const frame = requestAnimationFrame(() =>
        setState({ loading: false, url: asset.url })
      );
      return () => cancelAnimationFrame(frame);
    }

    getStoredUpload(asset)
      .then((record) => {
        if (!active) return;
        if (!record) {
          setState({ loading: false, error: "Uploaded file is unavailable" });
          return;
        }
        objectUrl = URL.createObjectURL(record.blob);
        setState({ loading: false, url: objectUrl });
      })
      .catch(() => {
        if (active) setState({ loading: false, error: "Could not load uploaded file" });
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [asset]);

  return asset?.url ? { loading: false, url: asset.url } : state;
}
