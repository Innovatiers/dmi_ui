/** Data completeness reported by the API for distributed queries. */
export type Completeness = 'complete' | 'partial' | 'unavailable';

/** Standard CogniaWerks API error envelope (AI Coder §9). */
export interface ApiErrorEnvelope {
  readonly code: string;
  readonly message: string;
  readonly correlationId: string;
  readonly retriable: boolean;
  readonly sourceNetworkId?: string;
  readonly completeness?: Completeness;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly retryAfter?: number;
}

/** Error thrown by the API client for non-success responses. */
export class ApiError extends Error {
  readonly status: number;
  readonly envelope: ApiErrorEnvelope;

  constructor(status: number, envelope: ApiErrorEnvelope) {
    super(envelope.message);
    this.name = 'ApiError';
    this.status = status;
    this.envelope = envelope;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Returns whether a parsed JSON body matches the error envelope shape. */
export function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string' &&
    typeof value.correlationId === 'string' &&
    typeof value.retriable === 'boolean'
  );
}
