import type { components } from './generated/schema';

/** Security and privacy figures of the caller's tenant (`GET /api/v1/admin/security-overview`). */
export type SecurityOverview = components['schemas']['SecurityOverviewDto'];

/** Readiness of the platform services (`GET /api/v1/admin/health`). */
export type ServiceHealth = components['schemas']['ServiceHealthDto'];

/** Role names in the order of the API's integer role values. */
export const ROLE_NAMES = [
  'Operator',
  'Analyst',
  'ManagerApprover',
  'Administrator',
  'PlatformOperator',
  'Auditor',
] as const;

/** Network status names in the order of the API's integer status values. */
export const NETWORK_STATUS_NAMES = ['Draft', 'Active', 'Disabled'] as const;

/** Provider type names in the order of the API's integer provider values. */
export const PROVIDER_TYPE_NAMES = ['Mock', 'AnyLogRest'] as const;

/** Figure and health status codes reported by the API. */
export const METRIC_STATUS = { available: 'available', notAvailable: 'not_available' } as const;

/** Health status codes reported by the API. */
export const HEALTH_STATUS = { ready: 'ready', unavailable: 'unavailable', notAvailable: 'not_available' } as const;

/** Reason codes the UI can explain; any other code is shown as an unknown reason. */
export const KNOWN_REASONS = [
  'login_activity_not_recorded',
  'network_health_not_checked',
  'job_host_not_deployed',
  'database_unreachable',
] as const;

/** Health components the UI can name; any other component is shown by its code. */
export const KNOWN_COMPONENTS = ['api', 'database', 'job_host'] as const;

/** Returns the name of an integer enum value, or `undefined` for a value the UI does not know. */
export function nameOf<const T extends readonly string[]>(names: T, value: number): T[number] | undefined {
  return value >= 0 ? names.at(value) : undefined;
}

/** Returns whether a code is one of the listed codes. */
export function isKnown<const T extends readonly string[]>(
  codes: T,
  code: string | null | undefined,
): code is T[number] {
  const known: readonly string[] = codes;
  return code !== null && code !== undefined && known.includes(code);
}
