import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BountyUnlockDialog } from '../BountyUnlockDialog';

describe('BountyUnlockDialog', () => {
  it('does not render its content when closed', () => {
    render(
      <BountyUnlockDialog
        open={false}
        onOpenChange={vi.fn()}
        onEnter={vi.fn()}
        onStayHere={vi.fn()}
      />
    );

    expect(screen.queryByText('Unlock this question?')).not.toBeInTheDocument();
  });

  it('warns that the current code will be erased and mentions the first-10 bonus', () => {
    render(
      <BountyUnlockDialog
        open={true}
        onOpenChange={vi.fn()}
        onEnter={vi.fn()}
        onStayHere={vi.fn()}
      />
    );

    expect(screen.getByText(/current code will be erased/i)).toBeInTheDocument();
    expect(screen.getByText(/first 10 correct submissions/i)).toBeInTheDocument();
  });

  it('calls onEnter when Enter Bounty is clicked', async () => {
    const onEnter = vi.fn();
    const user = userEvent.setup();

    render(
      <BountyUnlockDialog
        open={true}
        onOpenChange={vi.fn()}
        onEnter={onEnter}
        onStayHere={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Enter Bounty' }));

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('calls onStayHere when Stay Here is clicked', async () => {
    const onStayHere = vi.fn();
    const user = userEvent.setup();

    render(
      <BountyUnlockDialog
        open={true}
        onOpenChange={vi.fn()}
        onEnter={vi.fn()}
        onStayHere={onStayHere}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Stay Here' }));

    expect(onStayHere).toHaveBeenCalledTimes(1);
  });
});
