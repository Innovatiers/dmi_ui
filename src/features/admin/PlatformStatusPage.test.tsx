import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ServiceHealth } from '../../api/governance';
import { envelope, fakeApi, isRequest, json, pending } from '../../../test/fakeApi';
import { seriousViolations } from '../../../test/axe';
import { PlatformStatusPage } from './PlatformStatusPage';

const health: ServiceHealth = {
  checkedAt: '2026-10-22T12:00:00+00:00',
  components: [
    { component: 'api', status: 'ready', reason: null },
    { component: 'database', status: 'unavailable', reason: 'database_unreachable' },
    { component: 'job_host', status: 'not_available', reason: 'job_host_not_deployed' },
  ],
  dataProviders: [],
};

const healthyApi = () =>
  fakeApi((request) => {
    if (isRequest(request, 'GET', '/api/v1/system/info')) {
      return json({ applicationName: 'CogniaWerks', version: '0.12.0', serverTimeUtc: '2026-10-22T12:00:00Z' });
    }
    if (isRequest(request, 'GET', '/api/v1/admin/health')) {
      return json(health);
    }
    if (isRequest(request, 'GET', '/api/v1/features')) {
      return json({
        items: [
          { name: 'AnyLogLiveRest', enabled: false },
          { name: 'DashboardStudio', enabled: true },
        ],
      });
    }
    return envelope(404, 'NOT_FOUND');
  });

describe('PlatformStatusPage', () => {
  it('shows loading states until the status arrives', () => {
    const { client } = fakeApi(() => pending());

    render(<PlatformStatusPage client={client} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Platform status' })).toBeInTheDocument();
    expect(screen.getByText('Loading the service health…')).toBeInTheDocument();
  });

  it('shows the version, the readiness of API and database, and the feature flags', async () => {
    const { client } = healthyApi();

    render(<PlatformStatusPage client={client} />);

    expect(await screen.findByText('0.12.0')).toBeInTheDocument();
    const components = within(await screen.findByRole('table', { name: 'Platform components' })).getAllByRole('row');
    expect(components[1]).toHaveTextContent('APIReady');
    expect(components[2]).toHaveTextContent('Database');
    expect(components[2]).toHaveTextContent('Unavailable');
    expect(components[2]).toHaveTextContent('The database did not respond.');
    const flags = within(screen.getByRole('table', { name: 'Feature flags of your tenant' })).getAllByRole('row');
    expect(flags[1]).toHaveTextContent('AnyLogLiveRestOff');
    expect(flags[2]).toHaveTextContent('DashboardStudioOn');
  });

  it('shows a refused service health (403) with its correlation ID while the rest still shows', async () => {
    const { client } = fakeApi((request) => {
      if (isRequest(request, 'GET', '/api/v1/admin/health')) {
        return envelope(403, 'FORBIDDEN', 'corr-403');
      }
      return isRequest(request, 'GET', '/api/v1/features')
        ? json({ items: [] })
        : json({ applicationName: 'CogniaWerks', version: '0.12.0', serverTimeUtc: '2026-10-22T12:00:00Z' });
    });

    render(<PlatformStatusPage client={client} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Only administrators and platform operators can view the service health.');
    expect(alert).toHaveTextContent('Reference: corr-403');
    expect(await screen.findByText('0.12.0')).toBeInTheDocument();
  });

  it('shows an unavailable service (503 with envelope)', async () => {
    const { client } = fakeApi(() => envelope(503, 'INTERNAL_ERROR'));

    render(<PlatformStatusPage client={client} />);

    const alerts = await screen.findAllByRole('alert');
    expect(alerts).toHaveLength(3);
    expect(alerts[0]).toHaveTextContent('The service is temporarily unavailable.');
  });

  it('has no serious or critical accessibility violations', async () => {
    const { client } = healthyApi();
    const { container } = render(<PlatformStatusPage client={client} />);
    await screen.findByRole('table', { name: 'Feature flags of your tenant' });

    expect(await seriousViolations(container)).toEqual([]);
  });
});
