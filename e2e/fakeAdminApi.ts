import type { Page, Route } from '@playwright/test';

/**
 * A small stand-in for the CogniaWerks API for the administration E2E scenarios when no compose stack is given
 * (`E2E_API` unset). It knows the development users (`X-Dev-User`), authorises like the API's permission matrix
 * for the endpoints the scenarios use, answers refusals with the standard envelope, and keeps the member roles in
 * memory with an ETag per member. With `E2E_API=compose` the scenarios run against the real API instead.
 */

const ROLE_OF_USER = new Map<string, number>([
  ['admin-a', 3],
  ['operator-a', 0],
  ['analyst-a', 1],
  ['manager-a', 2],
  ['auditor-a', 5],
  ['platform-operator', 4],
]);

const ADMINISTRATOR = 3;
const AUDITOR = 5;

interface Member {
  readonly id: string;
  readonly subjectId: string;
  role: number;
  version: number;
}

function envelope(route: Route, status: number, code: string, correlationId: string) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify({ code, message: 'Refused', correlationId, retriable: false }),
  });
}

function ok(route: Route, body: unknown, etag?: string) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: etag ? { ETag: etag } : {},
    body: JSON.stringify(body),
  });
}

function details(member: Member) {
  return {
    id: member.id,
    subjectId: member.subjectId,
    role: member.role,
    status: 0,
    createdAt: '2026-10-20T08:00:00+00:00',
    grants: [],
  };
}

/** Routes every `/api/v1/` request of the page to the stand-in. */
export async function installFakeAdminApi(page: Page): Promise<void> {
  const members: Member[] = [...ROLE_OF_USER.entries()]
    .filter(([, role]) => role !== 4)
    .map(([subjectId, role], index) => ({
      id: `00000000-0000-0000-0000-00000000000${String(index + 1)}`,
      subjectId,
      role,
      version: 1,
    }));
  let requestCount = 0;

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const correlationId = `e2e-${String((requestCount += 1))}`;
    const role = ROLE_OF_USER.get((await request.headerValue('X-Dev-User')) ?? '');

    if (role === undefined) {
      return envelope(route, 401, 'UNAUTHENTICATED', correlationId);
    }
    if (path === '/api/v1/features') {
      return ok(route, { items: [{ name: 'AnyLogLiveRest', enabled: false }] });
    }
    if (path.startsWith('/api/v1/admin/memberships')) {
      if (role !== ADMINISTRATOR) {
        return envelope(route, 403, 'FORBIDDEN', correlationId);
      }
      if (path === '/api/v1/admin/memberships' && method === 'GET') {
        return ok(route, { items: members.map(details), nextCursor: null });
      }
      const parts = path.split('/');
      const id = parts.at(5);
      const action = parts.at(6);
      const member = members.find((candidate) => candidate.id === id);
      if (!member) {
        return envelope(route, 404, 'NOT_FOUND', correlationId);
      }
      if (method === 'GET' && action === undefined) {
        return ok(route, details(member), `"${String(member.version)}"`);
      }
      if (method === 'PUT' && action === 'role') {
        if ((await request.headerValue('If-Match')) !== `"${String(member.version)}"`) {
          return envelope(route, 409, 'CONCURRENCY_CONFLICT', correlationId);
        }
        member.role = (request.postDataJSON() as { role: number }).role;
        member.version += 1;
        return ok(route, details(member), `"${String(member.version)}"`);
      }
    }
    if (path === '/api/v1/audit-events/export' && method === 'POST') {
      if (role !== ADMINISTRATOR && role !== AUDITOR) {
        return envelope(route, 403, 'FORBIDDEN', correlationId);
      }
      const format = (request.postDataJSON() as { format: string }).format;
      return route.fulfill({
        status: 200,
        contentType: format === 'csv' ? 'text/csv' : 'application/json',
        headers: { 'Content-Disposition': `attachment; filename="audit-events-20261022T120000Z.${format}"` },
        body: format === 'csv' ? 'id,occurredAt,actor\n' : '[]',
      });
    }
    if (path === '/api/v1/audit-events' && method === 'GET') {
      if (role !== ADMINISTRATOR && role !== AUDITOR) {
        return envelope(route, 403, 'FORBIDDEN', correlationId);
      }
      return ok(route, { items: [], nextCursor: null });
    }
    return envelope(route, 403, 'FORBIDDEN', correlationId);
  });
}
