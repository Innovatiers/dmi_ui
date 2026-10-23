import { vi } from 'vitest';
import { ApiClient } from '../src/api/client';

/** One request as the fake API received it. */
export interface FakeRequest {
  readonly method: string;
  /** Path and query, e.g. `/api/v1/admin/memberships?Limit=25`. */
  readonly url: string;
  readonly headers: Headers;
  /** The parsed JSON body, or `undefined`. */
  readonly body: unknown;
}

export type FakeHandler = (request: FakeRequest) => Response | Promise<Response>;

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  return input instanceof URL ? input.href : input.url;
}

/** An API client whose requests are answered by `handler`; every request is recorded in `requests`. */
export function fakeApi(handler: FakeHandler) {
  const requests: FakeRequest[] = [];
  const fetchFn = vi.fn<typeof fetch>((input, init) => {
    const request: FakeRequest = {
      method: init?.method ?? 'GET',
      url: urlOf(input),
      headers: new Headers(init?.headers),
      body: typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined,
    };
    requests.push(request);
    return Promise.resolve(handler(request));
  });
  const client = new ApiClient({
    baseUrl: '',
    fetchFn,
    createCorrelationId: () => 'corr-1',
    createIdempotencyKey: () => 'idem-1',
  });
  return { client, fetchFn, requests };
}

/** A JSON response, optionally with an ETag. */
export function json(body: unknown, status = 200, etag?: string): Response {
  return Response.json(body, { status, headers: etag ? { ETag: etag } : {} });
}

/** An error response with the standard envelope. */
export function envelope(status: number, code: string, correlationId = 'corr-err'): Response {
  return Response.json({ code, message: 'Refused', correlationId, retriable: status >= 500 }, { status });
}

/** A request that never answers (loading state). */
export function pending(): Promise<Response> {
  return new Promise<Response>(() => undefined);
}

/** Whether a request has this method and its path (without query) equals `path`. */
export function isRequest(request: FakeRequest, method: string, path: string): boolean {
  return request.method === method && request.url.split('?')[0] === path;
}
