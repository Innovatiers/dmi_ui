import type { Identity } from './session';

/**
 * The test users of the API's development-only authentication handler (`appsettings.Development.json`, story 03),
 * each with a seeded membership (story 08). Development builds only: the role switcher that offers them is not
 * rendered in a production build (DEC-04 interim, until the sign-in flow exists).
 */
export const DEV_USERS: readonly Identity[] = [
  { subject: 'admin-a', roles: ['Administrator'] },
  { subject: 'operator-a', roles: ['Operator'] },
  { subject: 'analyst-a', roles: ['Analyst'] },
  { subject: 'manager-a', roles: ['ManagerApprover'] },
  { subject: 'auditor-a', roles: ['Auditor'] },
  { subject: 'admin-b', roles: ['Administrator'] },
  { subject: 'platform-operator', roles: ['PlatformOperator'] },
];

/** Returns the development user with this subject, if any. */
export function findDevUser(subject: string | null | undefined): Identity | undefined {
  return DEV_USERS.find((user) => user.subject === subject);
}
