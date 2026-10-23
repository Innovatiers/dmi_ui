import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Tenant } from '../../api/governance';
import { envelope, fakeApi, isRequest, json, pending, type FakeRequest } from '../../../test/fakeApi';
import { seriousViolations } from '../../../test/axe';
import { TenantsPage } from './TenantsPage';

const demoA: Tenant = {
  id: 'a0000000-0000-0000-0000-00000000000a',
  name: 'demo-a',
  residencyPolicy: 'eu',
  status: 0,
  createdAt: '2026-10-01T08:00:00+00:00',
};

const demoB: Tenant = {
  id: 'b0000000-0000-0000-0000-00000000000b',
  name: 'demo-b',
  residencyPolicy: 'unspecified',
  status: 1,
  createdAt: '2026-10-02T08:00:00+00:00',
};

type Override = (request: FakeRequest) => Response | undefined;

function standardApi(override: Override = () => undefined) {
  return fakeApi((request) => {
    const overridden = override(request);
    if (overridden) {
      return overridden;
    }
    if (isRequest(request, 'GET', '/api/v1/admin/tenants')) {
      return json({ items: [demoA, demoB], nextCursor: null });
    }
    if (isRequest(request, 'GET', `/api/v1/admin/tenants/${demoA.id}`)) {
      return json(demoA, 200, '"3"');
    }
    return envelope(404, 'NOT_FOUND');
  });
}

describe('TenantsPage', () => {
  it('shows a loading state until the tenants arrive', () => {
    const { client } = fakeApi(() => pending());

    render(<TenantsPage client={client} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Tenants' })).toBeInTheDocument();
    expect(screen.getByText('Loading the tenants…')).toBeInTheDocument();
  });

  it('lists the tenants with residency and status', async () => {
    const { client } = standardApi();

    render(<TenantsPage client={client} />);

    const rows = within(await screen.findByRole('table', { name: 'Tenants' })).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('demo-a');
    expect(rows[1]).toHaveTextContent('Active');
    expect(rows[2]).toHaveTextContent('Suspended');
    expect(within(rows[2] as HTMLElement).getByRole('button', { name: 'Reactivate demo-b' })).toBeInTheDocument();
  });

  it('suspends a tenant after confirmation with the ETag of the listed version', async () => {
    const { client, requests } = standardApi((request) =>
      isRequest(request, 'PATCH', `/api/v1/admin/tenants/${demoA.id}`)
        ? json({ ...demoA, status: 1 }, 200, '"4"')
        : undefined,
    );
    render(<TenantsPage client={client} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Suspend demo-a' }));
    const dialog = screen.getByRole('dialog', { name: 'Suspend demo-a?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Suspend' }));

    expect(await screen.findByText('demo-a was suspended.')).toBeInTheDocument();
    const patch = requests.find((request) => request.method === 'PATCH');
    expect(patch?.headers.get('If-Match')).toBe('"3"');
    expect(patch?.body).toEqual({ status: 1 });
  });

  it('treats a tenant changed since the list was loaded as a conflict (409) and reloads', async () => {
    const { client, requests } = standardApi((request) =>
      isRequest(request, 'GET', `/api/v1/admin/tenants/${demoA.id}`)
        ? json({ ...demoA, status: 1 }, 200, '"9"')
        : undefined,
    );
    render(<TenantsPage client={client} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Suspend demo-a' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Suspend' }));

    expect(await screen.findByText(/changed by someone else/)).toBeInTheDocument();
    expect(requests.some((request) => request.method === 'PATCH')).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(requests.filter((request) => isRequest(request, 'GET', '/api/v1/admin/tenants'))).toHaveLength(2);
  });

  it('explains that a platform operator cannot suspend their own tenant', async () => {
    const { client } = standardApi((request) =>
      request.method === 'PATCH' ? envelope(409, 'OWN_TENANT_SUSPENSION') : undefined,
    );
    render(<TenantsPage client={client} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Suspend demo-a' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Suspend' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('You cannot suspend your own tenant.');
  });

  it('creates a tenant', async () => {
    const { client, requests } = standardApi((request) =>
      isRequest(request, 'POST', '/api/v1/admin/tenants')
        ? json({ ...demoA, id: 'c0000000-0000-0000-0000-00000000000c', name: 'demo-c' }, 201)
        : undefined,
    );
    render(<TenantsPage client={client} />);
    await screen.findByRole('table', { name: 'Tenants' });

    expect(screen.getByRole('button', { name: 'Create tenant' })).toBeDisabled();
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'demo-c');
    await userEvent.click(screen.getByRole('button', { name: 'Create tenant' }));

    expect(await screen.findByText('demo-c was created.')).toBeInTheDocument();
    const post = requests.find((request) => request.method === 'POST');
    expect(post?.body).toEqual({ name: 'demo-c', residencyPolicy: null });
    expect(post?.headers.get('Idempotency-Key')).toBe('idem-1');
  });

  it('shows a refusal (403) for a role other than platform operator', async () => {
    const { client } = fakeApi(() => envelope(403, 'FORBIDDEN', 'corr-403'));

    render(<TenantsPage client={client} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Only platform operators can manage tenants.');
    expect(alert).toHaveTextContent('Reference: corr-403');
  });

  it('shows an unavailable service (503 with envelope)', async () => {
    const { client } = fakeApi(() => envelope(503, 'INTERNAL_ERROR'));

    render(<TenantsPage client={client} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('The service is temporarily unavailable.');
  });

  it('has no serious or critical accessibility violations', async () => {
    const { client } = standardApi();
    const { container } = render(<TenantsPage client={client} />);
    await screen.findByRole('table', { name: 'Tenants' });

    expect(await seriousViolations(container)).toEqual([]);
  });
});
