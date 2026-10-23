import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../../App';
import { findDevUser } from '../../auth/devUsers';
import { setIdentity } from '../../auth/session';
import { seriousViolations } from '../../../test/axe';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function signInAs(subject: string) {
  setIdentity(findDevUser(subject) ?? null);
}

function sectionLinks() {
  const heading = screen.getByRole('heading', { level: 1, name: 'Administration' });
  const section = heading.closest('section') as HTMLElement;
  return within(section)
    .queryAllByRole('link')
    .map((link) => link.textContent);
}

describe('AdministrationPage', () => {
  it('links to the security and privacy dashboard', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() => new Promise<Response>(() => undefined)),
    );
    signInAs('admin-a');
    renderAt('/administration');

    expect(screen.getByRole('heading', { level: 1, name: 'Administration' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Security and privacy dashboard' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Security and privacy' })).toBeInTheDocument();
  });

  it('shows an administrator the tenant screens, not the tenant list', () => {
    signInAs('admin-a');
    renderAt('/administration');

    expect(sectionLinks()).toEqual([
      'Members and roles',
      'Audit trail',
      'Export and retention policy',
      'Platform status',
      'Security and privacy dashboard',
    ]);
  });

  it('shows a platform operator only the tenants and the platform status', () => {
    signInAs('platform-operator');
    renderAt('/administration');

    expect(sectionLinks()).toEqual(['Tenants', 'Platform status']);
  });

  it('shows an auditor only the audit trail and the security dashboard', () => {
    signInAs('auditor-a');
    renderAt('/administration');

    expect(sectionLinks()).toEqual(['Audit trail', 'Security and privacy dashboard']);
  });

  it('shows an operator no administration screens', () => {
    signInAs('operator-a');
    renderAt('/administration');

    expect(sectionLinks()).toEqual([]);
    expect(screen.getByText('Your role has no administration screens.')).toBeInTheDocument();
  });

  it('has no serious or critical accessibility violations', async () => {
    signInAs('admin-a');
    const { container } = renderAt('/administration');

    expect(await seriousViolations(container)).toEqual([]);
  });
});
