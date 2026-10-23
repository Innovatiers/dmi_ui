import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { ExportPolicySettings, RetentionPolicySettings } from '../../api/governance';
import { envelope, fakeApi, isRequest, json, pending, type FakeRequest } from '../../../test/fakeApi';
import { seriousViolations } from '../../../test/axe';
import { PoliciesPage } from './PoliciesPage';

const exportPolicy: ExportPolicySettings = {
  policies: [
    { exportType: 'audit', allowedRoles: [3, 5], isDefault: true },
    { exportType: 'measurements', allowedRoles: [3], isDefault: false },
  ],
};

const retentionPolicy: RetentionPolicySettings = {
  policies: [{ objectType: 'notifications', retentionDays: 90, legalHold: false }],
  protectedObjectTypes: ['audit_events', 'evidence'],
};

type Override = (request: FakeRequest) => Response | undefined;

function standardApi(override: Override = () => undefined) {
  return fakeApi((request) => {
    const overridden = override(request);
    if (overridden) {
      return overridden;
    }
    if (isRequest(request, 'GET', '/api/v1/admin/export-policy')) {
      return json(exportPolicy);
    }
    if (isRequest(request, 'GET', '/api/v1/admin/retention-policy')) {
      return json(retentionPolicy);
    }
    if (isRequest(request, 'PUT', '/api/v1/admin/export-policy')) {
      return json(exportPolicy);
    }
    if (isRequest(request, 'PUT', '/api/v1/admin/retention-policy')) {
      return json(retentionPolicy);
    }
    return envelope(404, 'NOT_FOUND');
  });
}

describe('PoliciesPage', () => {
  it('shows loading states and the retention banner', () => {
    const { client } = fakeApi(() => pending());

    render(<PoliciesPage client={client} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Export and retention policy' })).toBeInTheDocument();
    expect(screen.getAllByText('Loading the policy…')).toHaveLength(2);
    expect(screen.getByText(/Retention is not enforced automatically yet/)).toBeInTheDocument();
  });

  it('shows the export policy per type with the allowed roles checked', async () => {
    const { client } = standardApi();

    render(<PoliciesPage client={client} />);

    const audit = await screen.findByRole('group', { name: 'Audit trail (default)' });
    expect(within(audit).getByRole('checkbox', { name: 'Administrator' })).toBeChecked();
    expect(within(audit).getByRole('checkbox', { name: 'Auditor' })).toBeChecked();
    expect(within(audit).getByRole('checkbox', { name: 'Operator' })).not.toBeChecked();
    expect(within(audit).queryByRole('checkbox', { name: 'Platform operator' })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Measurements' })).toBeInTheDocument();
  });

  it('saves the narrowed export policy', async () => {
    const { client, requests } = standardApi();
    render(<PoliciesPage client={client} />);
    const audit = await screen.findByRole('group', { name: 'Audit trail (default)' });

    await userEvent.click(within(audit).getByRole('checkbox', { name: 'Auditor' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save export policy' }));

    expect(await screen.findByText('The export policy was saved.')).toBeInTheDocument();
    expect(requests.find((request) => isRequest(request, 'PUT', '/api/v1/admin/export-policy'))?.body).toEqual({
      policies: [
        { exportType: 'audit', allowedRoles: [3] },
        { exportType: 'measurements', allowedRoles: [3] },
      ],
    });
  });

  it('explains a widening export policy refused by the API (422)', async () => {
    const { client } = standardApi((request) =>
      isRequest(request, 'PUT', '/api/v1/admin/export-policy') ? envelope(422, 'EXPORT_ROLE_NOT_PERMITTED') : undefined,
    );
    render(<PoliciesPage client={client} />);
    const measurements = await screen.findByRole('group', { name: 'Measurements' });

    await userEvent.click(within(measurements).getByRole('checkbox', { name: 'Operator' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save export policy' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The export policy can only narrow');
  });

  it('saves retention terms, including a new data type without a term', async () => {
    const { client, requests } = standardApi();
    render(<PoliciesPage client={client} />);
    const notifications = await screen.findByRole('group', { name: 'notifications' });

    const days = within(notifications).getByRole('spinbutton', { name: 'Retention in days' });
    await userEvent.clear(days);
    await userEvent.type(days, '30');
    await userEvent.click(within(notifications).getByRole('checkbox', { name: 'Legal hold' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Data type to add' }), 'saved_views');
    await userEvent.click(screen.getByRole('button', { name: 'Add data type' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save retention' }));

    expect(await screen.findByText('The retention settings were saved.')).toBeInTheDocument();
    expect(requests.find((request) => isRequest(request, 'PUT', '/api/v1/admin/retention-policy'))?.body).toEqual({
      policies: [
        { objectType: 'notifications', retentionDays: 30, legalHold: true },
        { objectType: 'saved_views', retentionDays: null, legalHold: false },
      ],
    });
    expect(screen.getByText('Always kept (append-only): audit_events, evidence')).toBeInTheDocument();
  });

  it('explains that audit events cannot get a retention term (422)', async () => {
    const { client } = standardApi((request) =>
      isRequest(request, 'PUT', '/api/v1/admin/retention-policy') ? envelope(422, 'RETENTION_NOT_ALLOWED') : undefined,
    );
    render(<PoliciesPage client={client} />);
    await screen.findByRole('group', { name: 'notifications' });

    await userEvent.type(screen.getByRole('textbox', { name: 'Data type to add' }), 'audit_events');
    await userEvent.click(screen.getByRole('button', { name: 'Add data type' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save retention' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Audit events and evidence are always kept');
  });

  it('shows a refusal (403) for both policies', async () => {
    const { client } = fakeApi(() => envelope(403, 'FORBIDDEN', 'corr-403'));

    render(<PoliciesPage client={client} />);

    const alerts = await screen.findAllByRole('alert');
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent('Only administrators of this tenant can manage the policies.');
    expect(alerts[0]).toHaveTextContent('Reference: corr-403');
  });

  it('shows an unavailable service (503 with envelope)', async () => {
    const { client } = fakeApi(() => envelope(503, 'INTERNAL_ERROR'));

    render(<PoliciesPage client={client} />);

    expect((await screen.findAllByRole('alert'))[0]).toHaveTextContent('The service is temporarily unavailable.');
  });

  it('has no serious or critical accessibility violations', async () => {
    const { client } = standardApi();
    const { container } = render(<PoliciesPage client={client} />);
    await screen.findByRole('group', { name: 'notifications' });

    expect(await seriousViolations(container)).toEqual([]);
  });
});
