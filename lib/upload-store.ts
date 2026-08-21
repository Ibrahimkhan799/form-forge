"use client";

import { createId } from "@/lib/id";
import type { StoredAssetRef } from "@/lib/types";

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
  const database = await openDatabase();
  const reference: StoredAssetRef = {
    id: createId(16),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
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

export async function getStoredUpload(id: string) {
  const database = await openDatabase();
  const record = await new Promise<StoredAssetRecord | undefined>((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .get(id);
    request.onsuccess = () => resolve(request.result as StoredAssetRecord | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return record;
}

export async function deleteStoredUpload(id: string) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
