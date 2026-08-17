/**
 * lib/storage.ts
 * ----------------------------------------------------------------------------
 * Screenshot files on disk. On Railway this directory is a mounted persistent
 * Volume (UPLOAD_DIR=/data/uploads); locally it's ./uploads. Keeping all the
 * filesystem details here means the routes deal only in ids + buffers.
 *
 * ⚠️ Railway's default container filesystem is EPHEMERAL — without a Volume
 * mounted at UPLOAD_DIR, uploaded screenshots vanish on every redeploy.
 * ----------------------------------------------------------------------------
 */

import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { env } from '../env.js';

const uploadDir = path.resolve(env.UPLOAD_DIR);

/** Best-effort guarantee that the upload directory exists. */
export async function ensureUploadDir(): Promise<void> {
  await mkdir(uploadDir, { recursive: true });
}

/** Persist a file buffer and return the relative storage path to save in the DB. */
export async function saveScreenshotFile(buffer: Buffer, originalName: string): Promise<string> {
  await ensureUploadDir();
  const ext = path.extname(originalName).slice(0, 12); // guard against absurd extensions
  const fileName = `${randomUUID()}${ext}`;
  await writeFile(path.join(uploadDir, fileName), buffer);
  return fileName; // stored in screenshots.storage_path
}

/** Open a read stream for a stored screenshot (used to serve GET /screenshots/:id). */
export function readScreenshotStream(storagePath: string): Readable {
  return createReadStream(path.join(uploadDir, storagePath));
}

/** Remove a stored screenshot file; ignores "already gone". */
export async function deleteScreenshotFile(storagePath: string): Promise<void> {
  try {
    await unlink(path.join(uploadDir, storagePath));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}
