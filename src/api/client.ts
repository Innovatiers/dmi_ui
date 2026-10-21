import { ApiError, isApiErrorEnvelope } from './errors';

export const CORRELATION_HEADER = 'X-Correlation-ID';

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly fetchFn?: typeof fetch;
  readonly createCorrelationId?: () => string;
}

/**
 * Minimal typed client for the CogniaWerks API. The UI only talks to this API, never to AnyLog.
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

  /** Performs a GET request and parses the JSON body as `T`. */
  async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const correlationId = this.createCorrelationId();
    let response: Response;
    try {
      response = await this.fetchFn(`${this.baseUrl}${path}`, {
        method: 'GET',
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

    return (await response.json()) as T;
  }
}

/** Shared client configured from `VITE_API_BASE_URL`. */
export const apiClient = new ApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' });
