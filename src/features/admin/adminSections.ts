import type { Permission } from '../../auth/permissions';
import { hasPermission, useIdentity, type Identity } from '../../auth/session';
import { ADMINISTRATION_MODULE, MODULES, type ModuleDefinition } from '../../modules';

/** A screen of the administration module (M14). */
export interface AdminSection {
  /** i18n key suffix under `admin.sections`. */
  readonly id: 'tenants' | 'memberships' | 'audit' | 'policies' | 'platformStatus' | 'security';
  /** Path relative to the administration module. */
  readonly path: string;
  /** The permission the API requires for the screen's main read; the link is shown only with it. */
  readonly permission: Permission;
}

/** The administration screens in menu order. */
export const ADMIN_SECTIONS: readonly AdminSection[] = [
  { id: 'tenants', path: 'tenants', permission: 'ManageTenants' },
  { id: 'memberships', path: 'memberships', permission: 'Administer' },
  { id: 'audit', path: 'audit', permission: 'ReadAudit' },
  { id: 'policies', path: 'policies', permission: 'Administer' },
  { id: 'platformStatus', path: 'platform-status', permission: 'ViewServiceHealth' },
  { id: 'security', path: 'security', permission: 'ViewSecurityOverview' },
];

/** The administration screens the identity may open; empty without an identity (fail closed). */
export function visibleAdminSections(identity: Identity | null): readonly AdminSection[] {
  return ADMIN_SECTIONS.filter((section) => hasPermission(identity, section.permission));
}

/** The modules to list for the current identity: the administration module only with an administration screen. */
export function useVisibleModules(): readonly ModuleDefinition[] {
  const showAdministration = visibleAdminSections(useIdentity()).length > 0;
  return MODULES.filter((module) => module.id !== ADMINISTRATION_MODULE || showAdministration);
}
