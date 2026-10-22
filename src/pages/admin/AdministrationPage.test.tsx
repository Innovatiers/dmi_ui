import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../../App';
import { seriousViolations } from '../../../test/axe';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('AdministrationPage', () => {
  it('links to the security and privacy dashboard', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() => new Promise<Response>(() => undefined)),
    );
    renderAt('/administration');

    expect(screen.getByRole('heading', { level: 1, name: 'Administration' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Security and privacy dashboard' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Security and privacy' })).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('has no serious or critical accessibility violations', async () => {
    const { container } = renderAt('/administration');

    expect(await seriousViolations(container)).toEqual([]);
  });
});
