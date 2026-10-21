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

/** Error codes of the shared API conventions (pagination, optimistic concurrency, feature flags). */
export const API_ERROR_CODES = {
  invalidCursor: 'INVALID_CURSOR',
  invalidLimit: 'INVALID_LIMIT',
  concurrencyConflict: 'CONCURRENCY_CONFLICT',
  preconditionRequired: 'PRECONDITION_REQUIRED',
  featureDisabled: 'FEATURE_DISABLED',
} as const;

/** Returns whether an error is a 409 because the resource changed since it was loaded (reload, then retry). */
export function isConcurrencyConflict(error: unknown): error is ApiError {
  return error instanceof ApiError && error.envelope.code === API_ERROR_CODES.concurrencyConflict;
}
