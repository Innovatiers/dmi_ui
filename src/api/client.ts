import { ApiError, isApiErrorEnvelope } from './errors';
import type { paths } from './generated/schema';

export const CORRELATION_HEADER = 'X-Correlation-ID';

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly fetchFn?: typeof fetch;
  readonly createCorrelationId?: () => string;
}

/** API paths that support GET, taken from the generated contract types. */
export type GetPath = {
  [P in keyof paths]: paths[P] extends { get: object } ? P : never;
}[keyof paths];

type GetOperation<P extends GetPath> = paths[P]['get'];

type JsonBody<R> = R extends { content: { 'application/json': infer B } } ? B : never;

/** The JSON body of a successful (200) GET response. */
export type GetResponse<P extends GetPath> =
  GetOperation<P> extends { responses: { 200: infer R } } ? JsonBody<R> : never;

type PathParams<P extends GetPath> = GetOperation<P> extends { parameters: { path: infer X } } ? X : never;

type QueryParams<P extends GetPath> = GetOperation<P> extends { parameters: { query?: infer X } } ? X : never;

/** Options of a GET request; `path` is required exactly when the route has path parameters. */
export type GetOptions<P extends GetPath> = {
  readonly query?: QueryParams<P>;
  readonly signal?: AbortSignal;
} & ([PathParams<P>] extends [never] ? { readonly path?: never } : { readonly path: PathParams<P> });

type GetArgs<P extends GetPath> = [PathParams<P>] extends [never]
  ? [options?: GetOptions<P>]
  : [options: GetOptions<P>];

/** A parsed response body together with its ETag (versioned resources, see the API's If-Match convention). */
export interface ApiResponse<T> {
  readonly data: T;
  readonly etag: string | null;
}

function formatParameter(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return undefined;
}

function entriesOf(value: unknown): [string, unknown][] {
  return typeof value === 'object' && value !== null ? Object.entries(value) : [];
}

/** Fills `{name}` placeholders and appends the query string; undefined query values are left out. */
export function buildUrl(template: string, pathParams?: unknown, query?: unknown): string {
  const values = new Map(entriesOf(pathParams));
  const path = template.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = formatParameter(values.get(name));
    if (value === undefined) {
      throw new Error(`Missing path parameter '${name}' for ${template}`);
    }
    return encodeURIComponent(value);
  });

  const search = new URLSearchParams();
  for (const [name, raw] of entriesOf(query)) {
    const value = formatParameter(raw);
    if (value !== undefined) {
      search.append(name, value);
    }
  }
  const queryString = search.toString();
  return queryString ? `${path}?${queryString}` : path;
}

/**
 * Thin client for the CogniaWerks API, typed by the generated contract (`src/api/generated/schema.d.ts`).
 * The UI only talks to this API, never to AnyLog.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;
  private readonly createCorrelationId: () => string;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.fetchFn = options.fetchFn ?? ((input, init) => fetch(input, init));
    this.createCorrelationId = options.createCorrelationId ?? (() => crypto.randomUUID().replaceAll('-', ''));
  }

  /** GETs a contract path and returns the typed body. */
  async get<P extends GetPath>(path: P, ...args: GetArgs<P>): Promise<GetResponse<P>> {
    return (await this.getWithETag(path, ...args)).data;
  }

  /** GETs a contract path and returns the typed body with its ETag (for a later If-Match update). */
  async getWithETag<P extends GetPath>(path: P, ...args: GetArgs<P>): Promise<ApiResponse<GetResponse<P>>> {
    const [options] = args;
    const response = await this.send('GET', buildUrl(path, options?.path, options?.query), options?.signal);
    return { data: (await response.json()) as GetResponse<P>, etag: response.headers.get('ETag') };
  }

  private async send(method: string, pathAndQuery: string, signal?: AbortSignal): Promise<Response> {
    const correlationId = this.createCorrelationId();
    let response: Response;
    try {
      response = await this.fetchFn(`${this.baseUrl}${pathAndQuery}`, {
        method,
        headers: { Accept: 'application/json', [CORRELATION_HEADER]: correlationId },
        signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      throw new ApiError(0, { code: 'NETWORK_ERROR', message: 'Network error', correlationId, retriable: true });
    }

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      throw new ApiError(
        response.status,
        isApiErrorEnvelope(body)
          ? body
          : {
              code: `HTTP_${String(response.status)}`,
              message: response.statusText || 'Request failed',
              correlationId: response.headers.get(CORRELATION_HEADER) ?? correlationId,
              retriable: response.status >= 500,
            },
      );
    }

    return response;
  }
}

/** Shared client configured from `VITE_API_BASE_URL`. */
export const apiClient = new ApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' });
