import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { MODULES } from '../modules';
import { seriousViolations } from '../../test/axe';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('AppShell', () => {
  it('lists all fifteen modules in the main navigation', () => {
    renderAt('/');

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(nav).getAllByRole('link')).toHaveLength(MODULES.length + 1);
    expect(within(nav).getByRole('link', { name: 'AnyLog Integration Hub' })).toBeInTheDocument();
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

  it('has no serious or critical accessibility violations', async () => {
    const { container } = renderAt('/');

    expect(await seriousViolations(container)).toEqual([]);
  });
});
