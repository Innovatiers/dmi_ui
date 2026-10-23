import { describe, expect, it, vi } from 'vitest';
import { ApiClient, buildUrl, CORRELATION_HEADER, filenameFromDisposition } from './client';
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

  it('sends the extra request headers of the identity', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, systemInfo));
    const client = new ApiClient({
      baseUrl: '',
      fetchFn,
      createCorrelationId: () => 'corr-1',
      requestHeaders: () => ({ 'X-Dev-User': 'admin-a' }),
    });

    await client.get('/api/v1/system/info');

    expect(new Headers(fetchFn.mock.calls[0]?.[1]?.headers).get('X-Dev-User')).toBe('admin-a');
  });
});

describe('ApiClient mutations', () => {
  const membership = { id: 'm-1', subjectId: 'operator-a', role: 1, status: 0, createdAt: '2026-10-22T08:00:00Z' };

  function mutationClient(fetchFn: typeof fetch) {
    return new ApiClient({
      baseUrl: '',
      fetchFn,
      createCorrelationId: () => 'corr-1',
      createIdempotencyKey: () => 'idem-1',
    });
  }

  it('sends a PUT with If-Match and a JSON body and returns the new ETag', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(200, { ...membership, grants: [] }, { ETag: '"8"' }));

    const result = await mutationClient(fetchFn).mutate('put', '/api/v1/admin/memberships/{id}/role', {
      path: { id: 'm-1' },
      ifMatch: '"7"',
      body: { role: 1 },
    });

    const [url, init] = fetchFn.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);
    expect(url).toBe('/api/v1/admin/memberships/m-1/role');
    expect(init?.method).toBe('PUT');
    expect(headers.get('If-Match')).toBe('"7"');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Idempotency-Key')).toBeNull();
    expect(init?.body).toBe('{"role":1}');
    expect(result.etag).toBe('"8"');
    expect(result.data.subjectId).toBe('operator-a');
  });

  it('sends an Idempotency-Key with every POST', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse(201, { id: 'g-1', scope: 1, scopeObjectId: 's-1', createdAt: '2026-10-22T08:00:00Z' }),
      );

    await mutationClient(fetchFn).mutate('post', '/api/v1/admin/memberships/{id}/grants', {
      path: { id: 'm-1' },
      body: { scope: 1, scopeObjectId: 's-1' },
    });

    expect(new Headers(fetchFn.mock.calls[0]?.[1]?.headers).get('Idempotency-Key')).toBe('idem-1');
  });

  it('returns no body for 204 No Content', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));

    const result = await mutationClient(fetchFn).mutate('delete', '/api/v1/admin/memberships/{id}/grants/{grantId}', {
      path: { id: 'm-1', grantId: 'g-1' },
    });

    expect(fetchFn.mock.calls[0]?.[1]?.method).toBe('DELETE');
    expect(result.data).toBeUndefined();
  });

  it('throws ApiError with the envelope of a refused mutation', async () => {
    const envelope = { code: 'CONCURRENCY_CONFLICT', message: 'Changed', correlationId: 'srv-2', retriable: false };
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(409, envelope));

    const error = await mutationClient(fetchFn)
      .mutate('post', '/api/v1/admin/memberships/{id}/disable', { path: { id: 'm-1' }, ifMatch: '"1"' })
      .catch((e: unknown) => e);

    expect(isConcurrencyConflict(error)).toBe(true);
  });

  it('downloads a file with its name from Content-Disposition', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('id,actor\n', {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="audit-events-20261022T120000Z.csv"',
        },
      }),
    );

    const file = await mutationClient(fetchFn).download('/api/v1/audit-events/export', 'text/csv', {
      body: { format: 'csv', actor: 'admin-a' },
    });

    expect(new Headers(fetchFn.mock.calls[0]?.[1]?.headers).get('Accept')).toBe('text/csv');
    expect(file.filename).toBe('audit-events-20261022T120000Z.csv');
    expect(file.blob.size).toBe(9);
  });

  it('reads a file name without quotes and none at all', () => {
    expect(filenameFromDisposition('attachment; filename=a.json')).toBe('a.json');
    expect(filenameFromDisposition(null)).toBeNull();
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
