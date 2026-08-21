"use client";

import { createId } from "@/lib/id";
import type { StoredAssetRef } from "@/lib/types";
import {
  ensureSupabaseUser,
  getSupabaseClient,
} from "@/lib/supabase/client";

const DATABASE_NAME = "formforge-assets";
const STORE_NAME = "assets";
const DATABASE_VERSION = 1;

interface StoredAssetRecord extends StoredAssetRef {
  blob: Blob;
  createdAt: string;
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeUpload(file: File): Promise<StoredAssetRef> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const user = await ensureSupabaseUser();
      if (user) {
        const id = createId(16);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${user.id}/${id}/${safeName}`;
        const { error } = await supabase.storage
          .from("formforge-assets")
          .upload(path, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });
        if (error) throw error;
        const { data } = supabase.storage
          .from("formforge-assets")
          .getPublicUrl(path);
        return {
          id,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          storage: "supabase",
          path,
          url: data.publicUrl,
        };
      }
    } catch {
      // Fall back to IndexedDB when Storage is unavailable or not configured.
    }
  }

  const database = await openDatabase();
  const reference: StoredAssetRef = {
    id: createId(16),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    storage: "indexeddb",
  };
  const record: StoredAssetRecord = {
    ...reference,
    blob: file,
    createdAt: new Date().toISOString(),
  };

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  return reference;
}

export async function getStoredUpload(asset: StoredAssetRef) {
  if (asset.storage === "supabase" && asset.path) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.storage
        .from("formforge-assets")
        .download(asset.path);
      if (error) throw error;
      return {
        ...asset,
        blob: data,
        createdAt: new Date().toISOString(),
      } satisfies StoredAssetRecord;
    }
  }

  const database = await openDatabase();
  const record = await new Promise<StoredAssetRecord | undefined>((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .get(asset.id);
    request.onsuccess = () => resolve(request.result as StoredAssetRecord | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return record;
}

export async function deleteStoredUpload(asset: StoredAssetRef) {
  if (asset.storage === "supabase" && asset.path) {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.storage.from("formforge-assets").remove([asset.path]);
      return;
    }
  }

  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(asset.id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
