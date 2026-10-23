import { useCallback, useState } from 'react';

export interface ActionState {
  /** Whether an action is running; buttons are disabled meanwhile. */
  readonly busy: boolean;
  /** The error of the last action, if it failed. */
  readonly error: unknown;
  /** The confirmation of the last action, if it succeeded. */
  readonly notice: string | null;
  /** Runs an action; on success shows `success` and calls `onSuccess`, on failure keeps the error. */
  readonly run: (action: () => Promise<unknown>, success: string, onSuccess?: () => void) => Promise<boolean>;
  /** Clears the error and the confirmation. */
  readonly clear: () => void;
}

/** Tracks one change at a time on an administration screen: busy, failed (with the API error) or done. */
export function useAction(): ActionState {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<unknown>, success: string, onSuccess?: () => void) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      onSuccess?.();
      return true;
    } catch (caught: unknown) {
      setError(caught);
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const clear = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  return { busy, error, notice, run, clear };
}
