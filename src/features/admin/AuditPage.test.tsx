import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AuditEvent } from '../../api/governance';
import { envelope, fakeApi, isRequest, json, pending, type FakeRequest } from '../../../test/fakeApi';
import { seriousViolations } from '../../../test/axe';
import { AuditPage } from './AuditPage';

const roleChange: AuditEvent = {
  id: 'e0000000-0000-0000-0000-000000000001',
  occurredAt: '2026-10-22T10:15:00+00:00',
  actor: 'admin-a',
  action: 'Edit',
  entityType: 'Membership',
  entityId: 'm-1',
  oldState: '{"role":"Operator"}',
  newState: '{"role":"Analyst"}',
  correlationId: 'corr-change',
  causationId: null,
  payloadHash: 'abc',
};

const networkChange: AuditEvent = {
  id: 'e0000000-0000-0000-0000-000000000002',
  occurredAt: '2026-10-22T09:00:00+00:00',
  actor: 'admin-a',
  action: 'Edit',
  entityType: 'Network',
  entityId: 'n-1',
  oldState: null,
  newState: '{"displayName":"Plant A","credentialRef":"openbao://tenant-a/anylog"}',
  correlationId: 'corr-network',
  causationId: null,
  payloadHash: 'def',
};

type Override = (request: FakeRequest) => Response | undefined;

function standardApi(override: Override = () => undefined) {
  return fakeApi((request) => {
    const overridden = override(request);
    if (overridden) {
      return overridden;
    }
    if (isRequest(request, 'GET', '/api/v1/audit-events')) {
      return json({ items: [roleChange, networkChange], nextCursor: null });
    }
    if (isRequest(request, 'POST', '/api/v1/audit-events/export')) {
      const csv = (request.body as { format: string }).format === 'csv';
      return new Response(csv ? 'id,actor\n' : '[]', {
        headers: {
          'Content-Type': csv ? 'text/csv' : 'application/json',
          'Content-Disposition': `attachment; filename="audit-events-20261022T120000Z.${csv ? 'csv' : 'json'}"`,
        },
      });
    }
    return envelope(404, 'NOT_FOUND');
  });
}

describe('AuditPage', () => {
  it('shows a loading state until the events arrive', () => {
    const { client } = fakeApi(() => pending());

    render(<AuditPage client={client} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Audit trail' })).toBeInTheDocument();
    expect(screen.getByText('Loading the audit trail…')).toBeInTheDocument();
  });

  it('lists the events with local time, UTC tooltip and the recorded changes', async () => {
    const { client } = standardApi();

    render(<AuditPage client={client} />);

    const rows = within(await screen.findByRole('table', { name: 'Audit events' })).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Membership: m-1');
    expect(rows[1]).toHaveTextContent('corr-change');
    const time = within(rows[1] as HTMLElement).getByText((_, element) => element?.tagName === 'TIME');
    expect(time).toHaveAttribute('dateTime', '2026-10-22T10:15:00+00:00');
    expect(time.getAttribute('title')).toMatch(/^UTC: .*10:15:00/);
    expect(rows[1]).toHaveTextContent('"role": "Analyst"');
  });

  it('never shows a credential reference from a recorded state', async () => {
    const { client } = standardApi();

    render(<AuditPage client={client} />);

    const rows = within(await screen.findByRole('table', { name: 'Audit events' })).getAllByRole('row');
    expect(rows[2]).toHaveTextContent('Plant A');
    expect(rows[2]).toHaveTextContent('••••••');
    expect(document.body).not.toHaveTextContent('openbao://');
  });

  it('applies the filter as query parameters, converting local times to UTC', async () => {
    const { client, requests } = standardApi();
    render(<AuditPage client={client} />);
    await screen.findByRole('table', { name: 'Audit events' });

    await userEvent.type(screen.getByRole('textbox', { name: 'Actor' }), 'admin-a');
    await userEvent.type(screen.getByRole('textbox', { name: 'Action' }), 'Export');
    await userEvent.type(screen.getByLabelText('From'), '2026-10-22T10:00');
    await userEvent.click(screen.getByRole('button', { name: 'Apply filter' }));

    await vi.waitFor(() => {
      expect(requests.at(-1)?.url).toContain('Actor=admin-a');
    });
    const url = new URL(requests.at(-1)?.url ?? '', 'http://x');
    expect(url.searchParams.get('Action')).toBe('Export');
    expect(url.searchParams.get('From')).toBe(new Date('2026-10-22T10:00').toISOString());
    expect(url.searchParams.get('Limit')).toBe('50');
  });

  it('exports the filtered trail as CSV and JSON', async () => {
    const saveFile = vi.fn<(blob: Blob, filename: string) => void>();
    const { client, requests } = standardApi();
    render(<AuditPage client={client} saveFile={saveFile} />);
    await screen.findByRole('table', { name: 'Audit events' });
    await userEvent.type(screen.getByRole('textbox', { name: 'Actor' }), 'auditor-a');
    await userEvent.click(screen.getByRole('button', { name: 'Apply filter' }));

    await userEvent.click(screen.getByRole('button', { name: 'Export as CSV' }));

    expect(await screen.findByText('The CSV export was downloaded.')).toBeInTheDocument();
    const exported = requests.find((request) => request.method === 'POST');
    expect(exported?.body).toMatchObject({ format: 'csv', actor: 'auditor-a' });
    expect(exported?.headers.get('Accept')).toBe('text/csv');
    expect(saveFile).toHaveBeenCalledWith(expect.anything(), 'audit-events-20261022T120000Z.csv');
    expect(saveFile.mock.calls[0]?.[0].size).toBe(9);

    await userEvent.click(screen.getByRole('button', { name: 'Export as JSON' }));
    expect(await screen.findByText('The JSON export was downloaded.')).toBeInTheDocument();
    expect(saveFile).toHaveBeenLastCalledWith(expect.anything(), 'audit-events-20261022T120000Z.json');
  });

  it('explains an export that is too large (422)', async () => {
    const saveFile = vi.fn();
    const { client } = standardApi((request) =>
      request.method === 'POST' ? envelope(422, 'EXPORT_TOO_LARGE') : undefined,
    );
    render(<AuditPage client={client} saveFile={saveFile} />);
    await screen.findByRole('table', { name: 'Audit events' });

    await userEvent.click(screen.getByRole('button', { name: 'Export as JSON' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The export is too large.');
    expect(saveFile).not.toHaveBeenCalled();
  });

  it('shows a refused export (403) with its correlation ID', async () => {
    const { client } = standardApi((request) =>
      request.method === 'POST' ? envelope(403, 'FORBIDDEN', 'corr-export') : undefined,
    );
    render(<AuditPage client={client} saveFile={vi.fn()} />);
    await screen.findByRole('table', { name: 'Audit events' });

    await userEvent.click(screen.getByRole('button', { name: 'Export as CSV' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Your role may not export the audit trail.');
    expect(alert).toHaveTextContent('Reference: corr-export');
  });

  it('shows a refusal (403) instead of the trail', async () => {
    const { client } = fakeApi(() => envelope(403, 'FORBIDDEN', 'corr-403'));

    render(<AuditPage client={client} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Only administrators and auditors of this tenant can read the audit trail.');
    expect(alert).toHaveTextContent('Reference: corr-403');
  });

  it('shows an unavailable service (503 with envelope)', async () => {
    const { client } = fakeApi(() => envelope(503, 'INTERNAL_ERROR'));

    render(<AuditPage client={client} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('The service is temporarily unavailable.');
  });

  it('has no serious or critical accessibility violations', async () => {
    const { client } = standardApi();
    const { container } = render(<AuditPage client={client} />);
    await screen.findByRole('table', { name: 'Audit events' });

    expect(await seriousViolations(container)).toEqual([]);
  });
});
