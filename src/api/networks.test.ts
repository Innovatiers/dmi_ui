import { describe, expect, it } from 'vitest';
import type { components } from './generated/schema';
import { ApiError } from './errors';
import { isNetworkDisabled, isNetworkHealthStatus, NETWORK_ERROR_CODES, NETWORK_HEALTH_STATUSES } from './networks';

function apiError(status: number, code: string): ApiError {
  return new ApiError(status, { code, message: 'm', correlationId: 'corr-1', retriable: false });
}

describe('network health statuses', () => {
  it('know degraded as its own status, next to ok and network', () => {
    expect(NETWORK_HEALTH_STATUSES).toContain('degraded');
    expect(new Set(NETWORK_HEALTH_STATUSES).size).toBe(NETWORK_HEALTH_STATUSES.length);
    expect(isNetworkHealthStatus('degraded')).toBe(true);
    expect(isNetworkHealthStatus('partial')).toBe(false);
    expect(isNetworkHealthStatus(undefined)).toBe(false);
  });

  it('match the status field of the contract types', () => {
    const check: components['schemas']['NetworkHealthCheckDto']['status'] = 'degraded';
    expect(isNetworkHealthStatus(check)).toBe(true);
  });
});

describe('isNetworkDisabled', () => {
  it('recognises the 409 NETWORK_DISABLED refusal only', () => {
    expect(isNetworkDisabled(apiError(409, NETWORK_ERROR_CODES.networkDisabled))).toBe(true);
    expect(isNetworkDisabled(apiError(409, 'CONCURRENCY_CONFLICT'))).toBe(false);
    expect(isNetworkDisabled(apiError(404, 'NOT_FOUND'))).toBe(false);
    expect(isNetworkDisabled(new Error('NETWORK_DISABLED'))).toBe(false);
  });
});
