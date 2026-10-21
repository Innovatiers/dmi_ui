import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataCompletenessBadge } from './DataCompletenessBadge';

describe('DataCompletenessBadge', () => {
  it('renders a quiet badge for complete data', () => {
    render(<DataCompletenessBadge completeness="complete" />);

    expect(screen.getByText('Complete data')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it.each([
    ['partial', 'Partial data'],
    ['unavailable', 'Data unavailable'],
  ] as const)('announces %s data explicitly', (completeness, label) => {
    render(<DataCompletenessBadge completeness={completeness} />);

    expect(screen.getByRole('status')).toHaveTextContent(label);
  });
});
