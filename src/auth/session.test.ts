import { describe, expect, it, vi } from 'vitest';
import { ASSIGNABLE_ROLES, rolesHavePermission, roleValue } from './permissions';
import { DEV_USERS, findDevUser } from './devUsers';
import { DEV_USER_HEADER, currentIdentity, hasPermission, identityHeaders, setIdentity } from './session';

describe('permission matrix copy', () => {
  it('matches the API matrix for the administration permissions', () => {
    expect(rolesHavePermission(['Administrator'], 'Administer')).toBe(true);
    expect(rolesHavePermission(['Administrator'], 'ReadAudit')).toBe(true);
    expect(rolesHavePermission(['Administrator'], 'ViewServiceHealth')).toBe(true);
    expect(rolesHavePermission(['Administrator'], 'ManageTenants')).toBe(false);
    expect(rolesHavePermission(['Auditor'], 'ReadAudit')).toBe(true);
    expect(rolesHavePermission(['Auditor'], 'ExportAudit')).toBe(true);
    expect(rolesHavePermission(['Auditor'], 'ViewSecurityOverview')).toBe(true);
    expect(rolesHavePermission(['Auditor'], 'Administer')).toBe(false);
    expect(rolesHavePermission(['Auditor'], 'ViewServiceHealth')).toBe(false);
    expect(rolesHavePermission(['PlatformOperator'], 'ManageTenants')).toBe(true);
    expect(rolesHavePermission(['PlatformOperator'], 'ViewServiceHealth')).toBe(true);
    expect(rolesHavePermission(['PlatformOperator'], 'ReadAudit')).toBe(false);
    expect(rolesHavePermission(['Operator'], 'Read')).toBe(true);
    expect(rolesHavePermission(['Operator'], 'Administer')).toBe(false);
  });

  it('grants nothing without roles', () => {
    expect(rolesHavePermission([], 'Read')).toBe(false);
  });

  it('never offers the platform operator role for a membership', () => {
    expect(ASSIGNABLE_ROLES).not.toContain('PlatformOperator');
    expect(ASSIGNABLE_ROLES).toHaveLength(5);
    expect(roleValue('Administrator')).toBe(3);
    expect(roleValue('Auditor')).toBe(5);
  });
});

describe('session', () => {
  it('sends the chosen development user as X-Dev-User in a development build', () => {
    setIdentity(findDevUser('admin-a') ?? null);

    expect(identityHeaders()).toEqual({ [DEV_USER_HEADER]: 'admin-a' });
    expect(currentIdentity()?.roles).toEqual(['Administrator']);
  });

  it('sends no identity header without a chosen user', () => {
    expect(identityHeaders()).toEqual({});
  });

  it('sends no identity header in a production build', () => {
    setIdentity(findDevUser('admin-a') ?? null);
    vi.stubEnv('DEV', false);

    expect(identityHeaders()).toEqual({});
  });

  it('remembers the chosen user for the browser session', () => {
    setIdentity(findDevUser('auditor-a') ?? null);
    expect(sessionStorage.getItem('cogniawerks.devUser')).toBe('auditor-a');

    setIdentity(null);
    expect(sessionStorage.getItem('cogniawerks.devUser')).toBeNull();
  });

  it('checks permissions fail closed', () => {
    expect(hasPermission(null, 'Read')).toBe(false);
    expect(hasPermission(findDevUser('auditor-a') ?? null, 'ReadAudit')).toBe(true);
    expect(hasPermission(findDevUser('auditor-a') ?? null, 'Administer')).toBe(false);
  });

  it('knows the development users of the API', () => {
    expect(DEV_USERS.map((user) => user.subject)).toEqual([
      'admin-a',
      'operator-a',
      'analyst-a',
      'manager-a',
      'auditor-a',
      'admin-b',
      'platform-operator',
    ]);
    expect(findDevUser('unknown')).toBeUndefined();
  });
});
