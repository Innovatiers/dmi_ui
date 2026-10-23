import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/errors';
import { ApiErrorMessage } from './ApiErrorMessage';

function apiError(status: number, code: string, correlationId = 'corr-9') {
  return new ApiError(status, { code, message: 'Refused', correlationId, retriable: status >= 500 });
}

describe('ApiErrorMessage', () => {
  it('shows a refusal (403) with its correlation ID', () => {
    render(<ApiErrorMessage error={apiError(403, 'FORBIDDEN')} forbiddenMessage="Only administrators." />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Only administrators.');
    expect(alert).toHaveTextContent('Reference: corr-9');
  });

  it('falls back to a generic refusal text', () => {
    render(<ApiErrorMessage error={apiError(403, 'FORBIDDEN')} />);

    expect(screen.getByRole('alert')).toHaveTextContent('You do not have permission for this.');
  });

  it('explains a concurrency conflict (409) and offers a reload', async () => {
    const onReload = vi.fn();
    render(<ApiErrorMessage error={apiError(409, 'CONCURRENCY_CONFLICT')} onReload={onReload} />);

    expect(screen.getByRole('alert')).toHaveTextContent('changed by someone else');
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));

    expect(onReload).toHaveBeenCalledOnce();
  });

  it('explains a known business refusal', () => {
    render(<ApiErrorMessage error={apiError(409, 'LAST_ADMIN')} />);

    expect(screen.getByRole('alert')).toHaveTextContent('The last active administrator');
    expect(screen.queryByRole('button', { name: 'Reload' })).not.toBeInTheDocument();
  });

  it('shows an unavailable service (503 with envelope) as retry later', () => {
    render(<ApiErrorMessage error={apiError(503, 'PROVIDER_UNAVAILABLE', 'corr-503')} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('temporarily unavailable');
    expect(alert).toHaveTextContent('Reference: corr-503');
  });

  it('shows a missing sign-in (401)', () => {
    render(<ApiErrorMessage error={apiError(401, 'UNAUTHENTICATED')} />);

    expect(screen.getByRole('alert')).toHaveTextContent('You are not signed in.');
  });

  it('shows an unreachable server and unexpected errors', () => {
    const { unmount } = render(<ApiErrorMessage error={apiError(0, 'NETWORK_ERROR')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('The server could not be reached.');
    unmount();

    render(<ApiErrorMessage error={new Error('boom')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
  });
});
