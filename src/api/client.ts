import { identityHeaders } from '../auth/session';
import { ApiError, isApiErrorEnvelope } from './errors';
import type { paths } from './generated/schema';

export const CORRELATION_HEADER = 'X-Correlation-ID';

export const IF_MATCH_HEADER = 'If-Match';
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly fetchFn?: typeof fetch;
  readonly createCorrelationId?: () => string;
  /** Creates the `Idempotency-Key` of a POST; one key per call, so a retry after an error is a new request. */
  readonly createIdempotencyKey?: () => string;
  /** Extra headers for every request, read per request (the development identity, see `src/auth/session.ts`). */
  readonly requestHeaders?: () => Readonly<Record<string, string>>;
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

/** HTTP methods that change something. */
export type MutationMethod = 'post' | 'put' | 'patch' | 'delete';

/** API paths that support a mutation method, taken from the generated contract types. */
export type MutationPath<M extends MutationMethod> = {
  [P in keyof paths]: paths[P] extends { [K in M]: object } ? P : never;
}[keyof paths];

/** The contract operation of a path and method. */
export type OperationOf<P extends keyof paths, M extends string> = paths[P] extends { [K in M]: infer O } ? O : never;

type RequestBodyOf<O> = O extends { requestBody: { content: { 'application/json': infer B } } } ? B : never;

type OperationPathParams<O> = O extends { parameters: { path: infer X } } ? X : never;

type RequiresIfMatch<O> = O extends { parameters: { header: { 'If-Match': string } } } ? true : false;

/** The JSON body of a successful mutation (200 or 201); `undefined` for 204 No Content. */
export type MutationResult<O> = O extends { responses: { 200: infer R } }
  ? JsonBody<R>
  : O extends { responses: { 201: infer R } }
    ? JsonBody<R>
    : undefined;

/**
 * Options of a mutation, derived from the contract: `path` when the route has path parameters, `body` when it takes
 * a JSON body, and `ifMatch` (the ETag of the loaded version) when the route requires `If-Match`.
 */
export type MutationOptions<O> = { readonly signal?: AbortSignal } & ([OperationPathParams<O>] extends [never]
  ? { readonly path?: never }
  : { readonly path: OperationPathParams<O> }) &
  ([RequestBodyOf<O>] extends [never] ? { readonly body?: never } : { readonly body: RequestBodyOf<O> }) &
  (RequiresIfMatch<O> extends true ? { readonly ifMatch: string } : { readonly ifMatch?: never });

interface RawMutationOptions {
  readonly signal?: AbortSignal;
  readonly path?: unknown;
  readonly body?: unknown;
  readonly ifMatch?: string;
}

interface SendOptions {
  readonly signal?: AbortSignal;
  readonly body?: unknown;
  readonly accept?: string;
  readonly headers?: Readonly<Record<string, string>>;
}

/** A file returned by the API, for example an audit export. */
export interface DownloadedFile {
  readonly blob: Blob;
  /** The file name from `Content-Disposition`, or `null` when the API sent none. */
  readonly filename: string | null;
}

/** Reads the file name from a `Content-Disposition` header. */
export function filenameFromDisposition(disposition: string | null): string | null {
  const match = disposition ? /filename="?([^";]+)"?/i.exec(disposition) : null;
  return match?.[1] ?? null;
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
  private readonly createIdempotencyKey: () => string;
  private readonly requestHeaders: () => Readonly<Record<string, string>>;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.fetchFn = options.fetchFn ?? ((input, init) => fetch(input, init));
    this.createCorrelationId = options.createCorrelationId ?? (() => crypto.randomUUID().replaceAll('-', ''));
    this.createIdempotencyKey = options.createIdempotencyKey ?? (() => crypto.randomUUID());
    this.requestHeaders = options.requestHeaders ?? (() => ({}));
  }

  /** GETs a contract path and returns the typed body. */
  async get<P extends GetPath>(path: P, ...args: GetArgs<P>): Promise<GetResponse<P>> {
    return (await this.getWithETag(path, ...args)).data;
  }

  /** GETs a contract path and returns the typed body with its ETag (for a later If-Match update). */
  async getWithETag<P extends GetPath>(path: P, ...args: GetArgs<P>): Promise<ApiResponse<GetResponse<P>>> {
    const [options] = args;
    const response = await this.send('GET', buildUrl(path, options?.path, options?.query), { signal: options?.signal });
    return { data: (await response.json()) as GetResponse<P>, etag: response.headers.get('ETag') };
  }

  /**
   * Sends a POST, PUT, PATCH or DELETE to a contract path and returns the typed body with the new ETag. A POST
   * carries a fresh `Idempotency-Key`; `ifMatch` is sent as `If-Match` (409 `CONCURRENCY_CONFLICT` when the
   * resource changed since it was loaded).
   */
  async mutate<M extends MutationMethod, P extends MutationPath<M>>(
    method: M,
    path: P,
    options: MutationOptions<OperationOf<P, M>>,
  ): Promise<ApiResponse<MutationResult<OperationOf<P, M>>>> {
    const response = await this.sendMutation(method, path, options, 'application/json');
    const text = response.status === 204 ? '' : await response.text();
    return {
      data: (text ? JSON.parse(text) : undefined) as MutationResult<OperationOf<P, M>>,
      etag: response.headers.get('ETag'),
    };
  }

  /** POSTs to a contract path that answers with a file (for example the audit export) and returns that file. */
  async download<P extends MutationPath<'post'>>(
    path: P,
    accept: string,
    options: MutationOptions<OperationOf<P, 'post'>>,
  ): Promise<DownloadedFile> {
    const response = await this.sendMutation('post', path, options, accept);
    return {
      blob: await response.blob(),
      filename: filenameFromDisposition(response.headers.get('Content-Disposition')),
    };
  }

  private sendMutation(
    method: MutationMethod,
    path: string,
    options: RawMutationOptions,
    accept: string,
  ): Promise<Response> {
    const headers = new Map<string, string>();
    if (options.ifMatch !== undefined) {
      headers.set(IF_MATCH_HEADER, options.ifMatch);
    }
    if (method === 'post') {
      headers.set(IDEMPOTENCY_HEADER, this.createIdempotencyKey());
    }
    return this.send(method.toUpperCase(), buildUrl(path, options.path), {
      signal: options.signal,
      body: options.body,
      accept,
      headers: Object.fromEntries(headers),
    });
  }

  private async send(method: string, pathAndQuery: string, options: SendOptions): Promise<Response> {
    const correlationId = this.createCorrelationId();
    const headers = new Headers(this.requestHeaders());
    for (const [name, value] of Object.entries(options.headers ?? {})) {
      headers.set(name, value);
    }
    headers.set('Accept', options.accept ?? 'application/json');
    headers.set(CORRELATION_HEADER, correlationId);
    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    let response: Response;
    try {
      response = await this.fetchFn(`${this.baseUrl}${pathAndQuery}`, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
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

/**
 * Shared client configured from `VITE_API_BASE_URL`. In a development build it sends the identity chosen in the
 * development role switcher (DEC-04 interim); a production build sends no identity header.
 */
export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  requestHeaders: identityHeaders,
});
