import { ApiError } from './errors';
import type { components } from './generated/schema';

/** The stored outcome of one network test (`POST /api/v1/anylog/networks/{id}/test`). */
export type NetworkHealthCheck = components['schemas']['NetworkHealthCheckDto'];

/** The outcome of one dataset discovery (`POST /api/v1/anylog/networks/{id}/discover`). */
export type DatasetDiscovery = components['schemas']['DatasetDiscoveryDto'];

/**
 * Classified outcomes of a network test or discovery (ADR-036). `degraded` is a partially successful response
 * (for example `PARTIAL_RESPONSE`): not a network error, and never `ok` (DEC-45-2b).
 */
export const NETWORK_HEALTH_STATUSES = [
  'ok',
  'degraded',
  'auth',
  'network',
  'timeout',
  'invalid_config',
  'unavailable',
  'feature_disabled',
] as const;

export type NetworkHealthStatus = (typeof NETWORK_HEALTH_STATUSES)[number];

/** Error codes of refused network actions. */
export const NETWORK_ERROR_CODES = {
  /** Test or discovery of a disabled network of the own tenant (409, DEC-45-3b). */
  networkDisabled: 'NETWORK_DISABLED',
} as const;

/** The network actions that call the provider and are refused for a disabled network. */
export type NetworkAction = 'test' | 'discover';

/** Returns whether a status is one the UI can name; any other status is shown as unknown. */
export function isNetworkHealthStatus(status: string | null | undefined): status is NetworkHealthStatus {
  const known: readonly string[] = NETWORK_HEALTH_STATUSES;
  return typeof status === 'string' && known.includes(status);
}

/** Returns whether an error is the 409 refusal of a test or discovery because the network is disabled. */
export function isNetworkDisabled(error: unknown): error is ApiError {
  return (
    error instanceof ApiError && error.status === 409 && error.envelope.code === NETWORK_ERROR_CODES.networkDisabled
  );
}
