import { useCallback, useState } from 'react';
import { useApiQuery, type ApiQueryState } from './useApiQuery';

/** One page of a cursor-paginated list, as returned by the API. */
export interface CursorPage<T> {
  readonly items: readonly T[];
  readonly nextCursor?: string | null;
}

export interface CursorPagesState<T> extends ApiQueryState<CursorPage<T>> {
  /** One-based number of the current page. */
  readonly page: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
  readonly next: () => void;
  readonly previous: () => void;
  /** Loads the current page again (after a change, or after a concurrency conflict). */
  readonly reload: () => void;
  /** Starts again at the first page (after a new filter). */
  readonly reset: () => void;
}

/**
 * Pages through a cursor-paginated list. `load` gets the cursor of the requested page (`undefined` for the first)
 * and must be stable (`useCallback`); a new `load` starts again at the first page.
 */
export function useCursorPages<T>(
  load: (cursor: string | undefined, signal: AbortSignal) => Promise<CursorPage<T>>,
): CursorPagesState<T> {
  const [position, setPosition] = useState<{ load: typeof load; cursors: readonly (string | undefined)[] }>({
    load,
    cursors: [undefined],
  });
  const [version, setVersion] = useState(0);
  const cursors = position.load === load ? position.cursors : [undefined];
  const cursor = cursors.at(-1);

  const loadPage = useCallback((signal: AbortSignal) => load(cursor, signal), [load, cursor]);
  const state = useApiQuery(loadPage, version);
  const nextCursor = state.data?.nextCursor ?? null;

  return {
    ...state,
    page: cursors.length,
    hasPrevious: cursors.length > 1,
    hasNext: nextCursor !== null,
    next: () => {
      if (nextCursor !== null) {
        setPosition({ load, cursors: [...cursors, nextCursor] });
      }
    },
    previous: () => {
      setPosition({ load, cursors: cursors.slice(0, -1) });
    },
    reload: () => {
      setVersion((value) => value + 1);
    },
    reset: () => {
      setPosition({ load, cursors: [undefined] });
      setVersion((value) => value + 1);
    },
  };
}
