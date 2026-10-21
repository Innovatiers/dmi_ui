import { describe, expect, it, vi } from 'vitest';
import { ApiClient, CORRELATION_HEADER } from './client';
import { ApiError } from './errors';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function createClient(fetchFn: typeof fetch) {
  return new ApiClient({ baseUrl: 'https://api.example.test/', fetchFn, createCorrelationId: () => 'corr-1' });
}

describe('ApiClient', () => {
  it('sends the correlation id and returns the parsed body', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, { ok: true }));

    const result = await createClient(fetchFn).get<{ ok: boolean }>('/api/v1/system/info');

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchFn.mock.calls[0] ?? [];
    expect(url).toBe('https://api.example.test/api/v1/system/info');
    expect((init?.headers as Record<string, string>)[CORRELATION_HEADER]).toBe('corr-1');
  });

  it('throws ApiError with the server envelope', async () => {
    const envelope = { code: 'NOT_FOUND', message: 'Missing', correlationId: 'srv-9', retriable: false };
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(404, envelope));

    const error = await createClient(fetchFn).get('/x').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).envelope).toEqual(envelope);
  });

  it('synthesises an envelope for non-envelope error bodies', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(new Response('boom', { status: 503 }));

    const error = (await createClient(fetchFn).get('/x').catch((e: unknown) => e)) as ApiError;

    expect(error.envelope).toMatchObject({ code: 'HTTP_503', correlationId: 'corr-1', retriable: true });
  });

  it('maps network failures to a retriable NETWORK_ERROR', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));

    const error = (await createClient(fetchFn).get('/x').catch((e: unknown) => e)) as ApiError;

    expect(error.status).toBe(0);
    expect(error.envelope).toMatchObject({ code: 'NETWORK_ERROR', retriable: true });
  });

  it('rethrows aborts unchanged', async () => {
    const abort = new DOMException('Aborted', 'AbortError');
    const fetchFn = vi.fn<typeof fetch>().mockRejectedValue(abort);

    await expect(createClient(fetchFn).get('/x')).rejects.toBe(abort);
  });
});
