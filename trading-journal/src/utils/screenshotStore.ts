/**
 * utils/screenshotStore.ts
 * ----------------------------------------------------------------------------
 * Stores trade screenshots as Blobs in IndexedDB, keyed by a random id.
 *
 * Why IndexedDB instead of localStorage? Screenshots are the one piece of
 * data in this app that can get large fast — localStorage caps out around
 * 5-10MB total (as base64 text, a handful of PNGs would blow through that
 * instantly). IndexedDB comfortably stores much larger binary blobs and
 * doesn't force everything through JSON.stringify.
 *
 * Trades only ever store the *ids* of their screenshots (see
 * `Trade.screenshotIds`); components resolve an id to a viewable image with
 * `loadScreenshotObjectUrl`, and MUST revoke the returned object URL when
 * they're done with it (see components/trades/ScreenshotUpload.tsx for the
 * pattern — load in a useEffect, revoke in its cleanup function).
 * ----------------------------------------------------------------------------
 */

const DB_NAME = 'trading-journal';
const DB_VERSION = 1;
const STORE_NAME = 'screenshots';

interface StoredScreenshot {
  id: string;
  blob: Blob;
  fileName: string;
  createdAt: string;
}

/** Opens (and lazily creates) the single IndexedDB database this app uses. */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

/** Saves an image file and returns the id to store on a Trade. */
export async function saveScreenshot(file: File): Promise<string> {
  const id = crypto.randomUUID();
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const record: StoredScreenshot = {
      id,
      blob: file,
      fileName: file.name,
      createdAt: new Date().toISOString(),
    };
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to save screenshot'));
  });

  db.close();
  return id;
}

/** Loads a screenshot and returns a blob: object URL ready for an <img src>.
 *  Returns null if the id doesn't exist (e.g. it was already deleted). */
export async function loadScreenshotObjectUrl(id: string): Promise<string | null> {
  const db = await openDatabase();

  const record = await new Promise<StoredScreenshot | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as StoredScreenshot | undefined);
    request.onerror = () => reject(request.error ?? new Error('Failed to load screenshot'));
  });

  db.close();
  return record ? URL.createObjectURL(record.blob) : null;
}

/** Permanently removes a screenshot (called when a trade is deleted, or a
 *  screenshot is removed from a trade before saving). */
export async function deleteScreenshot(id: string): Promise<void> {
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to delete screenshot'));
  });

  db.close();
}
