import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { seriousViolations } from '../../test/axe';
import { ApiError } from '../api/errors';
import { NetworkActionError } from './NetworkActionError';

function apiError(status: number, code: string): ApiError {
  return new ApiError(status, { code, message: 'server text', correlationId: 'corr-409', retriable: false });
}

describe('NetworkActionError', () => {
  it.each([
    ['test', 'The connection test was refused.'],
    ['discover', 'Dataset discovery was refused.'],
  ] as const)('explains 409 NETWORK_DISABLED for %s', async (action, refused) => {
    const { container } = render(<NetworkActionError action={action} error={apiError(409, 'NETWORK_DISABLED')} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(refused);
    expect(alert).toHaveTextContent('This network is disabled.');
    expect(alert).toHaveTextContent('Its health and datasets can still be viewed.');
    expect(alert).not.toHaveTextContent('Something went wrong');
    expect(await seriousViolations(container)).toEqual([]);
  });

  it('shows the generic error with the reference for other failures', () => {
    render(<NetworkActionError action="test" error={apiError(404, 'NOT_FOUND')} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong. Please try again.');
    expect(alert).toHaveTextContent('corr-409');
    expect(alert).not.toHaveTextContent('disabled');
  });

  it('shows the generic error without reference for a non-API failure', () => {
    render(<NetworkActionError action="discover" error={new Error('offline')} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
  });
});
