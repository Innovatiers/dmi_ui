import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from './client';
import { ApiError } from './errors';
import { FEATURE_FLAGS, useFeatureFlags } from './useFeatureFlags';

function clientReturning(response: Promise<Response>) {
  const fetchFn = vi.fn<typeof fetch>().mockReturnValue(response);
  return { client: new ApiClient({ baseUrl: '', fetchFn, createCorrelationId: () => 'corr-1' }), fetchFn };
}

const flags = {
  items: [
    { name: 'AnyLogLiveRest', enabled: false },
    { name: 'DashboardStudio', enabled: true },
    { name: 'AlertNotifications', enabled: false },
  ],
};

describe('useFeatureFlags', () => {
  it('is loading and fails closed until the flags arrive', () => {
    const { client } = clientReturning(new Promise<Response>(() => undefined));

    const { result } = renderHook(() => useFeatureFlags(client));

    expect(result.current.status).toBe('loading');
    expect(result.current.isEnabled(FEATURE_FLAGS.dashboardStudio)).toBe(false);
  });

  it('reports the flags of the current tenant', async () => {
    const { client, fetchFn } = clientReturning(Promise.resolve(Response.json(flags)));

    const { result } = renderHook(() => useFeatureFlags(client));

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(fetchFn.mock.calls[0]?.[0]).toBe('/api/v1/features');
    expect(result.current.isEnabled(FEATURE_FLAGS.dashboardStudio)).toBe(true);
    expect(result.current.isEnabled(FEATURE_FLAGS.anyLogLiveRest)).toBe(false);
    expect(result.current.flags).toHaveLength(3);
  });

  it('fails closed and exposes the error when loading fails', async () => {
    const envelope = { code: 'UNAUTHENTICATED', message: 'No', correlationId: 'c', retriable: false };
    const { client } = clientReturning(Promise.resolve(Response.json(envelope, { status: 401 })));

    const { result } = renderHook(() => useFeatureFlags(client));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.isEnabled(FEATURE_FLAGS.dashboardStudio)).toBe(false);
  });

  it('aborts the request on unmount', () => {
    const { client, fetchFn } = clientReturning(new Promise<Response>(() => undefined));

    const { unmount } = renderHook(() => useFeatureFlags(client));
    unmount();

    expect(fetchFn.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  });
});
