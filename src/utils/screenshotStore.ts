/**
 * utils/screenshotStore.ts
 * ----------------------------------------------------------------------------
 * Stores trade screenshots via the backend API.
 * ----------------------------------------------------------------------------
 */

import { api } from './api';

/** Saves an image file and returns the id to store on a Trade. */
export async function saveScreenshot(file: File): Promise<string> {
  return api.screenshots.upload(file);
}

/** Loads a screenshot and returns a blob: object URL ready for an <img src>.
 *  Returns null if the id doesn't exist (e.g. it was already deleted). */
export async function loadScreenshotObjectUrl(id: string): Promise<string | null> {
  return api.screenshots.objectUrl(id);
}

/** Permanently removes a screenshot (called when a trade is deleted, or a
 *  screenshot is removed from a trade before saving). */
export async function deleteScreenshot(id: string): Promise<void> {
  return api.screenshots.remove(id);
}
