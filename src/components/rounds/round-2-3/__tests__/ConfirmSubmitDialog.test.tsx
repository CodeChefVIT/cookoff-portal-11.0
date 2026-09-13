import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmSubmitDialog } from '../ConfirmSubmitDialog';

describe('ConfirmSubmitDialog', () => {
  it('does not render its content when closed', () => {
    render(
      <ConfirmSubmitDialog
        open={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.queryByText('Confirm Final Submission')).not.toBeInTheDocument();
  });

  it('calls onConfirm when the Submit Code button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmSubmitDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        isSubmitting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Submit Code' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmSubmitDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
        isSubmitting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('disables Submit Code and shows a busy label while submitting', () => {
    render(
      <ConfirmSubmitDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isSubmitting={true}
      />
    );

    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
  });
});
