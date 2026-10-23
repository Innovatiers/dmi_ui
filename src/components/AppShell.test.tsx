import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { findDevUser } from '../auth/devUsers';
import { setIdentity } from '../auth/session';
import { MODULES } from '../modules';
import { seriousViolations } from '../../test/axe';

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

describe('AppShell', () => {
  it('lists all fifteen modules for an administrator', () => {
    signInAs('admin-a');
    renderAt('/');

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(nav).getAllByRole('link')).toHaveLength(MODULES.length + 1);
    expect(within(nav).getByRole('link', { name: 'AnyLog Integration Hub' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Administration' })).toBeInTheDocument();
  });

  it('hides the administration module from a role without administration screens', () => {
    signInAs('operator-a');
    renderAt('/');

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(nav).getAllByRole('link')).toHaveLength(MODULES.length);
    expect(within(nav).queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
  });

  it('hides the administration module without an identity (fail closed)', () => {
    renderAt('/');

    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
  });

  it('renders the module placeholder for a module route', () => {
    renderAt('/alerts');

    expect(screen.getByRole('heading', { level: 1, name: 'Monitoring & Alerts' })).toBeInTheDocument();
  });

  it('renders not found for unknown routes', () => {
    renderAt('/does-not-exist');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });

  it('has a skip link to the main content', () => {
    renderAt('/');

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('offers the development role switcher in a development build and updates the menu', async () => {
    renderAt('/');

    const switcher = screen.getByRole('combobox', { name: 'Development identity' });
    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();

    await userEvent.selectOptions(switcher, 'auditor-a');

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(nav).getByRole('link', { name: 'Administration' })).toBeInTheDocument();
  });

  it('has no role switcher in a production build', () => {
    vi.stubEnv('DEV', false);
    renderAt('/');

    expect(screen.queryByRole('combobox', { name: 'Development identity' })).not.toBeInTheDocument();
  });

  it('has no serious or critical accessibility violations', async () => {
    signInAs('admin-a');
    const { container } = renderAt('/');

    expect(await seriousViolations(container)).toEqual([]);
  });
});
