/**
 * components/common/ConfirmDialog.tsx
 * ----------------------------------------------------------------------------
 * A small wrapper around Modal for "are you sure?" moments — currently just
 * deleting a trade, but written generically so it's reusable anywhere else
 * a destructive action needs a confirmation step.
 * ----------------------------------------------------------------------------
 */

import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="sm">
      <p className="confirm-message">{message}</p>
      <div className="modal-actions">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}