import { ROLE_NAMES } from '../api/governance';

/** A tenant role name, in the order of the API's integer role values. */
export type RoleName = (typeof ROLE_NAMES)[number];

/** Permission names of the API's permission matrix (`CogniaWerks.Application.Common.Authorization.Permission`). */
export type Permission =
  | 'Read'
  | 'Configure'
  | 'Investigate'
  | 'Acknowledge'
  | 'Assign'
  | 'Approve'
  | 'Export'
  | 'PublishModel'
  | 'Administer'
  | 'ManageTenants'
  | 'ReadAudit'
  | 'ExportAudit'
  | 'ViewServiceHealth'
  | 'ProposeDecision'
  | 'ViewSecurityOverview';

/**
 * Copy of the API's permission matrix (`PermissionMatrix.cs`), used only to decide which navigation entries to show.
 * The API stays leading: every request is authorised there, and a refusal (403) is shown as such. Keep this copy in
 * step with the API; `permissions.test.ts` pins it.
 */
const PERMISSION_MATRIX: ReadonlyMap<RoleName, ReadonlySet<Permission>> = new Map<RoleName, ReadonlySet<Permission>>([
  ['Operator', new Set<Permission>(['Read', 'Acknowledge'])],
  ['Analyst', new Set<Permission>(['Read', 'Investigate', 'ProposeDecision'])],
  ['ManagerApprover', new Set<Permission>(['Read', 'Assign', 'Approve', 'ProposeDecision'])],
  [
    'Administrator',
    new Set<Permission>([
      'Read',
      'Configure',
      'Export',
      'Administer',
      'ReadAudit',
      'ExportAudit',
      'ViewServiceHealth',
      'ViewSecurityOverview',
    ]),
  ],
  ['Auditor', new Set<Permission>(['ReadAudit', 'ExportAudit', 'ViewSecurityOverview'])],
  ['PlatformOperator', new Set<Permission>(['ManageTenants', 'ViewServiceHealth'])],
]);

/** Returns whether one of the roles holds the permission; no roles means no permission (fail closed). */
export function rolesHavePermission(roles: readonly RoleName[], permission: Permission): boolean {
  return roles.some((role) => PERMISSION_MATRIX.get(role)?.has(permission) === true);
}

/** Roles that can be assigned to a membership; PlatformOperator is never assigned through the tenant API. */
export const ASSIGNABLE_ROLES: readonly RoleName[] = ROLE_NAMES.filter((role) => role !== 'PlatformOperator');

/** Returns the API's integer value of a role name. */
export function roleValue(role: RoleName): number {
  return ROLE_NAMES.indexOf(role);
}
