import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { MembershipDetails } from '../../api/governance';
import { envelope, fakeApi, isRequest, json, pending, type FakeRequest } from '../../../test/fakeApi';
import { seriousViolations } from '../../../test/axe';
import { MembershipsPage } from './MembershipsPage';

const operator: MembershipDetails = {
  id: '11111111-0000-0000-0000-000000000001',
  subjectId: 'operator-a',
  role: 0,
  status: 0,
  createdAt: '2026-10-20T08:00:00+00:00',
  grants: [
    {
      id: '99999999-0000-0000-0000-000000000001',
      scope: 1,
      scopeObjectId: '55555555-0000-0000-0000-000000000005',
      createdAt: '2026-10-21T08:00:00+00:00',
    },
  ],
};

const admin: MembershipDetails = {
  id: '11111111-0000-0000-0000-000000000002',
  subjectId: 'admin-a',
  role: 3,
  status: 0,
  createdAt: '2026-10-19T08:00:00+00:00',
  grants: [],
};

const memberPath = `/api/v1/admin/memberships/${operator.id}`;

type Override = (request: FakeRequest) => Response | undefined;

/** A fake API with one page of two members and the operator's details at ETag "5". */
function standardApi(override: Override = () => undefined) {
  return fakeApi((request) => {
    const overridden = override(request);
    if (overridden) {
      return overridden;
    }
    if (isRequest(request, 'GET', '/api/v1/admin/memberships')) {
      return request.url.includes('Cursor=c2')
        ? json({ items: [admin], nextCursor: null })
        : json({ items: [operator, admin], nextCursor: 'c2' });
    }
    if (isRequest(request, 'GET', memberPath)) {
      return json(operator, 200, '"5"');
    }
    return envelope(404, 'NOT_FOUND');
  });
}

async function openEditor() {
  await userEvent.click(await screen.findByRole('button', { name: 'Manage operator-a' }));
  return screen.findByRole('heading', { level: 2, name: 'Manage operator-a' });
}

describe('MembershipsPage', () => {
  it('shows a loading state until the members arrive', () => {
    const { client } = fakeApi(() => pending());

    render(<MembershipsPage client={client} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Members and roles' })).toBeInTheDocument();
    expect(screen.getByText('Loading the members…')).toBeInTheDocument();
  });

  it('lists the members with role, status and scope, and pages with the cursor', async () => {
    const { client, requests } = standardApi();

    render(<MembershipsPage client={client} />);

    const table = await screen.findByRole('table', { name: 'Members' });
    const rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('operator-a');
    expect(rows[1]).toHaveTextContent('Operator');
    expect(rows[1]).toHaveTextContent('1 scope grant');
    expect(rows[2]).toHaveTextContent('Whole tenant');
    expect(requests[0]?.url).toBe('/api/v1/admin/memberships?Limit=25');

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(await screen.findByText('Page 2')).toBeInTheDocument();
    expect(requests.at(-1)?.url).toBe('/api/v1/admin/memberships?Limit=25&Cursor=c2');
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('changes the role with the ETag of the loaded version', async () => {
    const { client, requests } = standardApi((request) =>
      isRequest(request, 'PUT', `${memberPath}/role`) ? json({ ...operator, role: 1 }, 200, '"6"') : undefined,
    );
    render(<MembershipsPage client={client} />);
    await openEditor();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'New role' }), 'Analyst');
    await userEvent.click(screen.getByRole('button', { name: 'Change role' }));

    expect(await screen.findByText('The role was changed.')).toBeInTheDocument();
    const put = requests.find((request) => request.method === 'PUT');
    expect(put?.headers.get('If-Match')).toBe('"5"');
    expect(put?.body).toEqual({ role: 1 });
  });

  it('explains a change by someone else (409) and reloads the member', async () => {
    const { client, requests } = standardApi((request) =>
      isRequest(request, 'PUT', `${memberPath}/role`) ? envelope(409, 'CONCURRENCY_CONFLICT', 'corr-409') : undefined,
    );
    render(<MembershipsPage client={client} />);
    await openEditor();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'New role' }), 'Analyst');
    await userEvent.click(screen.getByRole('button', { name: 'Change role' }));

    const alert = await screen.findByText(/changed by someone else/);
    expect(alert.closest('[role="alert"]')).toHaveTextContent('Reference: corr-409');
    const reads = requests.filter((request) => isRequest(request, 'GET', memberPath)).length;

    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));

    await screen.findByRole('heading', { level: 2, name: 'Manage operator-a' });
    expect(requests.filter((request) => isRequest(request, 'GET', memberPath)).length).toBe(reads + 1);
    expect(screen.queryByText(/changed by someone else/)).not.toBeInTheDocument();
  });

  it('shows a refusal (403) with the correlation ID instead of the list', async () => {
    const { client } = fakeApi(() => envelope(403, 'FORBIDDEN', 'corr-403'));

    render(<MembershipsPage client={client} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Only administrators of this tenant can manage members.');
    expect(alert).toHaveTextContent('Reference: corr-403');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an unavailable service (503 with envelope)', async () => {
    const { client } = fakeApi(() => envelope(503, 'INTERNAL_ERROR', 'corr-503'));

    render(<MembershipsPage client={client} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('The service is temporarily unavailable.');
  });

  it('adds a site grant and removes a grant', async () => {
    const { client, requests } = standardApi((request) => {
      if (isRequest(request, 'POST', `${memberPath}/grants`)) {
        return json({ id: 'g-new', scope: 1, scopeObjectId: 'site-2', createdAt: '2026-10-22T08:00:00+00:00' }, 201);
      }
      if (isRequest(request, 'DELETE', `${memberPath}/grants/${operator.grants[0]?.id ?? ''}`)) {
        return new Response(null, { status: 204 });
      }
      return undefined;
    });
    render(<MembershipsPage client={client} />);
    await openEditor();

    const add = screen.getByRole('button', { name: 'Add scope grant' });
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Scope' }), 'Site');
    expect(add).toBeDisabled();
    await userEvent.type(screen.getByRole('textbox', { name: 'Site or asset ID' }), 'site-2');
    await userEvent.click(add);

    expect(await screen.findByText('The scope grant was added.')).toBeInTheDocument();
    expect(requests.find((request) => request.method === 'POST')?.body).toEqual({
      scope: 1,
      scopeObjectId: 'site-2',
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove scope Site 55555555-0000-0000-0000-000000000005' }),
    );

    expect(await screen.findByText('The scope grant was removed.')).toBeInTheDocument();
    expect(requests.some((request) => request.method === 'DELETE')).toBe(true);
  });

  it('refuses a grant on a site outside the tenant with an explanation (422)', async () => {
    const { client } = standardApi((request) =>
      isRequest(request, 'POST', `${memberPath}/grants`) ? envelope(422, 'GRANT_TARGET_NOT_FOUND') : undefined,
    );
    render(<MembershipsPage client={client} />);
    await openEditor();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Scope' }), 'Asset');
    await userEvent.type(screen.getByRole('textbox', { name: 'Site or asset ID' }), 'other');
    await userEvent.click(screen.getByRole('button', { name: 'Add scope grant' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The site or asset does not exist in this tenant.');
  });

  it('disables a member only after confirmation, with the ETag', async () => {
    const { client, requests } = standardApi((request) =>
      isRequest(request, 'POST', `${memberPath}/disable`) ? json({ ...operator, status: 1 }, 200, '"6"') : undefined,
    );
    render(<MembershipsPage client={client} />);
    await openEditor();

    await userEvent.click(screen.getByRole('button', { name: 'Disable member' }));
    expect(screen.getByRole('dialog', { name: 'Disable operator-a?' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(requests.some((request) => request.url.endsWith('/disable'))).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'Disable member' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Disable' }));

    expect(await screen.findByText('The member was disabled.')).toBeInTheDocument();
    const disable = requests.find((request) => request.url.endsWith('/disable'));
    expect(disable?.headers.get('If-Match')).toBe('"5"');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('explains that the last administrator cannot be disabled', async () => {
    const { client } = standardApi((request) =>
      isRequest(request, 'POST', `${memberPath}/disable`) ? envelope(409, 'LAST_ADMIN') : undefined,
    );
    render(<MembershipsPage client={client} />);
    await openEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Disable member' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Disable' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The last active administrator');
  });

  it('has no serious or critical accessibility violations with the editor open', async () => {
    const { client } = standardApi();
    const { container } = render(<MembershipsPage client={client} />);
    await openEditor();

    expect(await seriousViolations(container)).toEqual([]);
  });
});
