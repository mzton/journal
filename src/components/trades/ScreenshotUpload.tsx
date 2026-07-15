/**
 * components/trades/ScreenshotUpload.tsx
 * ----------------------------------------------------------------------------
 * Manages the list of screenshot ids for a trade being created/edited.
 * Files are written to IndexedDB immediately on selection (via
 * utils/screenshotStore) and only their ids are kept in form state — the
 * actual image bytes never touch React state or localStorage.
 *
 * Also exports `ScreenshotThumbnail` on its own, so TradeDetailModal can
 * reuse the same thumbnail-loading logic in read-only mode (no remove
 * button, just a click-to-enlarge lightbox).
 * ----------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react';
import { loadScreenshotObjectUrl, saveScreenshot } from '../../utils/screenshotStore';
import { Modal } from '../common/Modal';
import { ImageIcon, PlusIcon } from '../common/icons';

interface ScreenshotThumbnailProps {
  id: string;
  /** Omit to render read-only (no remove button) — used by TradeDetailModal. */
  onRemove?: () => void;
}

/** Loads one screenshot from IndexedDB, shows it as a thumbnail, and opens
 *  a full-size lightbox on click. Cleans up its object URL on unmount. */
export function ScreenshotThumbnail({ id, onRemove }: ScreenshotThumbnailProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    loadScreenshotObjectUrl(id).then((loaded) => {
      if (cancelled) {
        if (loaded) URL.revokeObjectURL(loaded);
        return;
      }
      objectUrl = loaded;
      setUrl(loaded);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  if (!url) {
    return <div className="screenshot-thumb screenshot-thumb--loading" aria-hidden="true" />;
  }

  return (
    <>
      <div className="screenshot-thumb">
        <button
          type="button"
          className="screenshot-thumb-image-button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label="View screenshot full size"
        >
          <img src={url} alt="Trade screenshot" className="screenshot-thumb-image" />
        </button>
        {onRemove && (
          <button
            type="button"
            className="screenshot-thumb-remove"
            onClick={onRemove}
            aria-label="Remove screenshot"
          >
            ×
          </button>
        )}
      </div>

      <Modal isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} title="Screenshot" maxWidth="lg">
        <img src={url} alt="Trade screenshot, full size" className="screenshot-lightbox-image" />
      </Modal>
    </>
  );
}

interface ScreenshotUploadProps {
  screenshotIds: string[];
  onChange: (ids: string[]) => void;
}

export function ScreenshotUpload({ screenshotIds, onChange }: ScreenshotUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const newIds = await Promise.all(Array.from(files).map((file) => saveScreenshot(file)));
      onChange([...screenshotIds, ...newIds]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="field">
      <span className="field-label">Screenshots</span>

      <div className="screenshot-grid">
        {screenshotIds.map((id) => (
          <ScreenshotThumbnail
            key={id}
            id={id}
            onRemove={() => onChange(screenshotIds.filter((existingId) => existingId !== id))}
          />
        ))}

        <button
          type="button"
          className="screenshot-add-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <ImageIcon size={18} /> : <PlusIcon size={18} />}
          <span>{isUploading ? 'Uploading…' : 'Add'}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        onChange={(event) => handleFilesSelected(event.target.files)}
      />
      <p className="field-hint">Chart screenshots for this trade — stored only in this browser.</p>
    </div>
  );
}
