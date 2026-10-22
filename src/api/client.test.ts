import { describe, expect, it, vi } from 'vitest';
import { ApiClient, buildUrl, CORRELATION_HEADER } from './client';
import { ApiError, isConcurrencyConflict } from './errors';

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

function createClient(fetchFn: typeof fetch) {
  return new ApiClient({ baseUrl: 'https://api.example.test/', fetchFn, createCorrelationId: () => 'corr-1' });
}

const systemInfo = { applicationName: 'CogniaWerks', version: '1.0.0', serverTimeUtc: '2026-10-21T12:00:00Z' };

describe('ApiClient', () => {
  it('sends the correlation id and returns the typed body', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, systemInfo));

    const result = await createClient(fetchFn).get('/api/v1/system/info');

    expect(result.applicationName).toBe('CogniaWerks');
    const [url, init] = fetchFn.mock.calls[0] ?? [];
    expect(url).toBe('https://api.example.test/api/v1/system/info');
    expect(init?.method).toBe('GET');
    expect(new Headers(init?.headers).get(CORRELATION_HEADER)).toBe('corr-1');
  });

  it('fills path parameters from the typed options', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, { membership: {} }));

    await createClient(fetchFn).get('/api/v1/tenancy/memberships/{id}', { path: { id: 'a/b' } });

    expect(fetchFn.mock.calls[0]?.[0]).toBe('https://api.example.test/api/v1/tenancy/memberships/a%2Fb');
  });

  it('returns the ETag with getWithETag', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, systemInfo, { ETag: '"42"' }));

    const result = await createClient(fetchFn).getWithETag('/api/v1/system/info');

    expect(result.etag).toBe('"42"');
    expect(result.data.version).toBe('1.0.0');
  });

  it('throws ApiError with the server envelope', async () => {
    const envelope = { code: 'NOT_FOUND', message: 'Missing', correlationId: 'srv-9', retriable: false };
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(404, envelope));

    const error = await createClient(fetchFn)
      .get('/api/v1/system/info')
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).envelope).toEqual(envelope);
  });

  it('recognises a concurrency conflict', async () => {
    const envelope = { code: 'CONCURRENCY_CONFLICT', message: 'Changed', correlationId: 'srv-1', retriable: false };
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(409, envelope));

    const error = await createClient(fetchFn)
      .get('/api/v1/system/info')
      .catch((e: unknown) => e);

    expect(isConcurrencyConflict(error)).toBe(true);
    expect(isConcurrencyConflict(new Error('other'))).toBe(false);
  });

  it('synthesises an envelope for non-envelope error bodies', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(new Response('boom', { status: 503 }));

    const error = (await createClient(fetchFn)
      .get('/api/v1/system/info')
      .catch((e: unknown) => e)) as ApiError;

    expect(error.envelope).toMatchObject({ code: 'HTTP_503', correlationId: 'corr-1', retriable: true });
  });

  it('maps network failures to a retriable NETWORK_ERROR', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));

    const error = (await createClient(fetchFn)
      .get('/api/v1/system/info')
      .catch((e: unknown) => e)) as ApiError;

    expect(error.status).toBe(0);
    expect(error.envelope).toMatchObject({ code: 'NETWORK_ERROR', retriable: true });
  });

  it('rethrows aborts unchanged', async () => {
    const abort = new DOMException('Aborted', 'AbortError');
    const fetchFn = vi.fn<typeof fetch>().mockRejectedValue(abort);

    await expect(createClient(fetchFn).get('/api/v1/system/info')).rejects.toBe(abort);
  });
});

describe('buildUrl', () => {
  it('appends defined query values and skips undefined ones', () => {
    expect(buildUrl('/api/v1/x', undefined, { limit: 20, cursor: 'a b', missing: undefined })).toBe(
      '/api/v1/x?limit=20&cursor=a+b',
    );
  });

  it('throws when a path parameter is missing', () => {
    expect(() => buildUrl('/api/v1/x/{id}', {})).toThrow("Missing path parameter 'id'");
  });
});
