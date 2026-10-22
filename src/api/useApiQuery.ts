import { useEffect, useState } from 'react';

export interface ApiQueryState<T> {
  readonly status: 'loading' | 'ready' | 'error';
  readonly data: T | undefined;
  readonly error: unknown;
}

/**
 * Runs one API read and tracks its state. `load` must be stable (wrap it in `useCallback`); a new function on every
 * render would reload. The request is aborted on unmount or when `load` changes; after a change the previous result
 * stays visible until the new one arrives.
 */
export function useApiQuery<T>(load: (signal: AbortSignal) => Promise<T>): ApiQueryState<T> {
  const [state, setState] = useState<ApiQueryState<T>>({ status: 'loading', data: undefined, error: undefined });

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) {
          setState({ status: 'ready', data, error: undefined });
        }
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', data: undefined, error });
        }
      },
    );
    return () => {
      controller.abort();
    };
  }, [load]);

  return state;
}
