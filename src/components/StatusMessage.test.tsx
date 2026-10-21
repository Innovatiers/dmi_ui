import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StatusMessage } from './StatusMessage';

describe('StatusMessage', () => {
  it('announces errors assertively with role="alert"', () => {
    render(<StatusMessage tone="error">Failed</StatusMessage>);

    expect(screen.getByRole('alert')).toHaveTextContent('Error');
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  });

  it('announces info politely and has no dismiss button without handler', () => {
    render(<StatusMessage tone="info">Note</StatusMessage>);

    expect(screen.getByRole('status')).toHaveTextContent('Note');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onDismiss from the dismiss button', async () => {
    const onDismiss = vi.fn();
    render(
      <StatusMessage tone="warning" onDismiss={onDismiss}>
        Careful
      </StatusMessage>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
