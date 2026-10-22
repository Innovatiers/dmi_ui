import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useApiQuery } from './useApiQuery';

describe('useApiQuery', () => {
  it('is loading until the data arrives, then ready', async () => {
    const load = vi.fn(() => Promise.resolve({ value: 42 }));

    const { result } = renderHook(() => useApiQuery(load));

    expect(result.current.status).toBe('loading');
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.data).toEqual({ value: 42 });
  });

  it('reports an error', async () => {
    const failure = new Error('boom');
    const load = vi.fn(() => Promise.reject(failure));

    const { result } = renderHook(() => useApiQuery(load));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.error).toBe(failure);
    expect(result.current.data).toBeUndefined();
  });

  it('aborts the request on unmount and ignores its late result', async () => {
    let resolve: (value: string) => void = () => undefined;
    const load = vi.fn((signal: AbortSignal) => {
      expect(signal.aborted).toBe(false);
      return new Promise<string>((done) => {
        resolve = done;
      });
    });

    const { result, unmount } = renderHook(() => useApiQuery(load));
    const signal = load.mock.calls[0]?.[0];
    unmount();
    resolve('late');
    await Promise.resolve();

    expect(signal?.aborted).toBe(true);
    expect(result.current.status).toBe('loading');
  });
});
