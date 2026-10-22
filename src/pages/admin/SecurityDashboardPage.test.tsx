import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../../api/client';
import type { SecurityOverview, ServiceHealth } from '../../api/governance';
import { seriousViolations } from '../../../test/axe';
import { SecurityDashboardPage } from './SecurityDashboardPage';

const overview: SecurityOverview = {
  generatedAt: '2026-10-22T12:00:00+00:00',
  usersByRole: [
    { role: 0, active: 4, disabled: 1 },
    { role: 1, active: 0, disabled: 0 },
    { role: 2, active: 0, disabled: 0 },
    { role: 3, active: 2, disabled: 0 },
    { role: 4, active: 0, disabled: 0 },
    { role: 5, active: 1, disabled: 0 },
  ],
  inactiveUsers: { status: 'not_available', reason: 'login_activity_not_recorded', count: null, thresholdDays: null },
  accessDenied: { forbiddenLast24Hours: 3, forbiddenLast7Days: 11, crossTenantLast24Hours: 0, crossTenantLast7Days: 2 },
  credentialRefs: {
    byNetworkStatus: [
      { networkStatus: 0, credentialRefs: 0, networksWithoutCredentialRef: 0, lastRotatedAt: null },
      {
        networkStatus: 1,
        credentialRefs: 1,
        networksWithoutCredentialRef: 1,
        lastRotatedAt: '2026-10-12T08:30:00+00:00',
      },
      { networkStatus: 2, credentialRefs: 0, networksWithoutCredentialRef: 0, lastRotatedAt: null },
    ],
    lastRotatedAt: '2026-10-12T08:30:00+00:00',
    networks: [
      {
        networkId: '11111111-1111-1111-1111-111111111111',
        externalNetworkId: 'net-a',
        displayName: 'Plant A',
        status: 1,
        hasCredentialRef: true,
        credentialRotatedAt: '2026-10-12T08:30:00+00:00',
      },
      {
        networkId: '22222222-2222-2222-2222-222222222222',
        externalNetworkId: 'net-b',
        displayName: 'Plant B',
        status: 1,
        hasCredentialRef: false,
        credentialRotatedAt: null,
      },
    ],
  },
  networkHealth: { status: 'not_available', reason: 'network_health_not_checked', failingNetworks: null },
  retention: {
    policies: [
      { objectType: 'measurements', retentionDays: 730, legalHold: false },
      { objectType: 'notifications', retentionDays: null, legalHold: true },
    ],
    protectedObjectTypes: ['audit_events', 'evidence'],
  },
  exports: { last30Days: 4, byType: [{ exportType: 'audit', count: 4 }] },
};

const health: ServiceHealth = {
  checkedAt: '2026-10-22T12:00:00+00:00',
  components: [
    { component: 'api', status: 'ready', reason: null },
    { component: 'database', status: 'ready', reason: null },
    { component: 'job_host', status: 'not_available', reason: 'job_host_not_deployed' },
  ],
  dataProviders: [
    {
      networkId: '11111111-1111-1111-1111-111111111111',
      externalNetworkId: 'net-a',
      displayName: 'Plant A',
      providerType: 0,
      networkStatus: 1,
      status: 'not_available',
      reason: 'network_health_not_checked',
    },
  ],
};

type Responder = (url: string) => Promise<Response>;

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  return input instanceof URL ? input.href : input.url;
}

function clientWith(responder: Responder) {
  const fetchFn = vi.fn<typeof fetch>((input) => responder(urlOf(input)));
  return { client: new ApiClient({ baseUrl: '', fetchFn, createCorrelationId: () => 'corr-1' }), fetchFn };
}

const healthy: Responder = (url) =>
  Promise.resolve(Response.json(url.endsWith('/security-overview') ? overview : health));

function envelope(status: number, code: string) {
  return Response.json({ code, message: 'Refused', correlationId: 'corr-err', retriable: false }, { status });
}

describe('SecurityDashboardPage', () => {
  it('shows a loading state until the figures arrive', () => {
    const { client } = clientWith(() => new Promise<Response>(() => undefined));

    render(<SecurityDashboardPage client={client} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Security and privacy' })).toBeInTheDocument();
    expect(screen.getByText('Loading the security overview…')).toBeInTheDocument();
  });

  it('shows the key figures from the security overview', async () => {
    const { client, fetchFn } = clientWith(healthy);

    render(<SecurityDashboardPage client={client} />);

    const kpis = await screen.findByRole('heading', { level: 2, name: 'Key figures' });
    const section = kpis.closest('section');
    expect(section).not.toBeNull();
    const figures = within(section as HTMLElement);
    expect(figures.getByText('Active users').nextElementSibling).toHaveTextContent('7');
    expect(figures.getByText('Refused requests (24 hours)').nextElementSibling).toHaveTextContent('3');
    expect(figures.getByText('Refused requests (7 days)').nextElementSibling).toHaveTextContent('11');
    expect(figures.getByText('Cross-tenant attempts (7 days)').nextElementSibling).toHaveTextContent('2');
    expect(figures.getByText('Exports (30 days)').nextElementSibling).toHaveTextContent('4');
    expect(figures.getByText('Active networks without credential reference').nextElementSibling).toHaveTextContent('1');
    expect(fetchFn.mock.calls.map(([url]) => urlOf(url))).toEqual(
      expect.arrayContaining(['/api/v1/admin/security-overview', '/api/v1/admin/health']),
    );
  });

  it('marks figures without a data source as not available instead of showing a number', async () => {
    const { client } = clientWith(healthy);

    render(<SecurityDashboardPage client={client} />);

    const inactive = await screen.findByText('Users without recent sign-in');
    expect(inactive.nextElementSibling).toHaveTextContent('Not available');
    expect(screen.getByText('Sign-ins are not recorded yet.')).toBeInTheDocument();
    expect(screen.getByText('Networks with failing health check').nextElementSibling).toHaveTextContent(
      'Not available',
    );
  });

  it('shows credential references as set or not set, never a value', async () => {
    const { client } = clientWith(healthy);

    render(<SecurityDashboardPage client={client} />);

    const table = await screen.findByRole('table', { name: 'Credential references per network' });
    const rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Plant A (net-a)');
    expect(rows[1]).toHaveTextContent('Set (value hidden)');
    expect(rows[2]).toHaveTextContent('Not set');
    expect(rows[2]).toHaveTextContent('Never');
    expect(table.textContent).not.toMatch(/openbao|#token/i);
  });

  it('shows users per role, retention and exports', async () => {
    const { client } = clientWith(healthy);

    render(<SecurityDashboardPage client={client} />);

    const users = await screen.findByRole('table', { name: 'Users per role' });
    expect(within(users).getByRole('row', { name: /Operator 4 1/ })).toBeInTheDocument();
    const retention = screen.getByRole('table', { name: 'Retention per data type' });
    expect(within(retention).getByRole('row', { name: /measurements 730 days No/ })).toBeInTheDocument();
    expect(within(retention).getByRole('row', { name: /notifications No term agreed Yes/ })).toBeInTheDocument();
    expect(screen.getByText('Always kept (append-only): audit_events, evidence')).toBeInTheDocument();
    const exports = screen.getByRole('table', { name: 'Exports in the last 30 days' });
    expect(within(exports).getByRole('row', { name: 'audit 4' })).toBeInTheDocument();
  });

  it('shows the service health with not available components', async () => {
    const { client } = clientWith(healthy);

    render(<SecurityDashboardPage client={client} />);

    const components = await screen.findByRole('table', { name: 'Platform components' });
    expect(within(components).getByRole('row', { name: /Database Ready/ })).toBeInTheDocument();
    expect(
      within(components).getByRole('row', { name: /Job host Not available There is no job host yet\./ }),
    ).toBeInTheDocument();
    const providers = screen.getByRole('table', { name: 'Data provider per network' });
    expect(
      within(providers).getByRole('row', { name: /Plant A \(net-a\) Mock Active Not available/ }),
    ).toBeInTheDocument();
  });

  it('explains a refusal (403) without showing figures', async () => {
    const { client } = clientWith(() => Promise.resolve(envelope(403, 'FORBIDDEN')));

    render(<SecurityDashboardPage client={client} />);

    expect(
      await screen.findByText('Only administrators and auditors of this tenant can view the security overview.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Only administrators and platform operators can view the service health.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Key figures' })).not.toBeInTheDocument();
  });

  it('shows an auditor the overview read-only while the service health is refused', async () => {
    const { client } = clientWith((url) =>
      url.endsWith('/health') ? Promise.resolve(envelope(403, 'FORBIDDEN')) : Promise.resolve(Response.json(overview)),
    );

    const { container } = render(<SecurityDashboardPage client={client} />);

    expect(await screen.findByRole('heading', { name: 'Key figures' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Users per role' })).toBeInTheDocument();
    expect(
      await screen.findByText('Only administrators and platform operators can view the service health.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Only administrators and auditors of this tenant can view the security overview.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(await seriousViolations(container)).toEqual([]);
  });

  it('shows a generic error with the reference for other failures', async () => {
    const { client } = clientWith((url) =>
      url.endsWith('/health') ? Promise.resolve(Response.json(health)) : Promise.resolve(envelope(500, 'INTERNAL')),
    );

    render(<SecurityDashboardPage client={client} />);

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Reference: corr-err')).toBeInTheDocument();
    expect(await screen.findByRole('table', { name: 'Platform components' })).toBeInTheDocument();
  });

  it('has no serious or critical accessibility violations', async () => {
    const { client } = clientWith(healthy);

    const { container } = render(<SecurityDashboardPage client={client} />);
    await screen.findByRole('table', { name: 'Platform components' });
    await screen.findByRole('table', { name: 'Users per role' });

    expect(await seriousViolations(container)).toEqual([]);
  });
});
