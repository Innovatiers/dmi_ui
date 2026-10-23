import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { seriousViolations } from '../../test/axe';
import { NETWORK_HEALTH_STATUSES } from '../api/networks';
import { NetworkHealthBadge } from './NetworkHealthBadge';

describe('NetworkHealthBadge', () => {
  it('shows degraded with its own label, symbol and explanation', () => {
    const { container } = render(<NetworkHealthBadge status="degraded" />);

    expect(screen.getByText('Degraded')).toBeInTheDocument();
    expect(screen.getByText(/answered only partly/)).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('◐');
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
    expect(screen.queryByText('Network unreachable')).not.toBeInTheDocument();
  });

  it.each([
    ['ok', 'Healthy', '✓'],
    ['network', 'Network unreachable', '✕'],
    ['timeout', 'Timed out', '✕'],
    ['feature_disabled', 'Provider switched off', '?'],
  ])('shows %s as "%s" with a symbol, not by colour alone', (status, label, symbol) => {
    const { container } = render(<NetworkHealthBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(symbol);
  });

  it('gives degraded a different label and symbol than ok and network', () => {
    const labels = ['ok', 'degraded', 'network'].map((status) => {
      const { container, unmount } = render(<NetworkHealthBadge status={status} />);
      const text = container.textContent;
      unmount();
      return text;
    });

    expect(new Set(labels).size).toBe(3);
  });

  it('shows an unknown status as unknown, never as healthy', () => {
    render(<NetworkHealthBadge status="partial" />);

    expect(screen.getByText('Unknown status')).toBeInTheDocument();
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
  });

  it('has a translated label for every status and no serious accessibility violations', async () => {
    const { container } = render(
      <ul>
        {NETWORK_HEALTH_STATUSES.map((status) => (
          <li key={status}>
            <NetworkHealthBadge status={status} />
          </li>
        ))}
      </ul>,
    );

    expect(container.textContent).not.toContain('networkHealth.');
    expect(await seriousViolations(container)).toEqual([]);
  });
});
