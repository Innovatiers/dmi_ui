import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { seriousViolations } from '../../test/axe';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';

function Harness({ onConfirm }: { readonly onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Open
      </Button>
      {open && (
        <ConfirmDialog
          title="Disable member?"
          confirmLabel="Disable"
          cancelLabel="Cancel"
          onConfirm={onConfirm}
          onCancel={() => {
            setOpen(false);
          }}
        >
          <p>The member loses access.</p>
        </ConfirmDialog>
      )}
    </>
  );
}

describe('ConfirmDialog', () => {
  it('opens as a labelled modal dialog with focus on cancel', async () => {
    render(<Harness onConfirm={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    const dialog = screen.getByRole('dialog', { name: 'Disable member?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('The member loses access.');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('keeps Tab and Shift+Tab inside the dialog', async () => {
    render(<Harness onConfirm={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Disable' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Disable' })).toHaveFocus();
  });

  it('cancels on Escape and returns focus to the opener', async () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(opener);

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms with the keyboard', async () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('has no serious or critical accessibility violations', async () => {
    const { container } = render(<Harness onConfirm={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(await seriousViolations(container)).toEqual([]);
  });
});
