import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  /** Disables both buttons while the confirmed action runs. */
  readonly busy?: boolean;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex="0"]';

/** Keeps Tab and Shift+Tab inside the container. */
function trapTab(event: KeyboardEvent, container: HTMLElement): void {
  const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
  const first = focusable.at(0);
  const last = focusable.at(-1);
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !container.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !container.contains(active))) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Modal confirmation dialog. Focus moves to the cancel button when it opens (the safe choice), Tab and Shift+Tab stay
 * inside the dialog, Escape cancels, and focus returns to the element that opened it when it closes.
 */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmDialogProps) {
  const titleId = useId();
  const bodyId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const cancelHandler = useRef(onCancel);
  const busyState = useRef(busy);

  useEffect(() => {
    cancelHandler.current = onCancel;
    busyState.current = busy;
  });

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!busyState.current) {
          cancelHandler.current();
        }
      } else if (event.key === 'Tab') {
        trapTab(event, dialog);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      opener?.focus();
    };
  }, []);

  return (
    <div className="cw-dialog-backdrop">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="cw-dialog"
      >
        <h2 id={titleId}>{title}</h2>
        <div id={bodyId}>{children}</div>
        <div className="cw-dialog__actions">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
