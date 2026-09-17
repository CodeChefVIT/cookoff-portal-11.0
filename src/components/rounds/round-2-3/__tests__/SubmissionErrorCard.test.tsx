import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SubmissionErrorCard } from '../SubmissionErrorCard';

describe('SubmissionErrorCard', () => {
  it('renders nothing while closed', () => {
    render(<SubmissionErrorCard open={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the Figma title and message as an alert', () => {
    render(<SubmissionErrorCard open onClose={vi.fn()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Submission Failed');
    expect(alert).toHaveTextContent(
      'An unexpected error occurred while running your code. Please try again later.'
    );
  });

  it('calls onClose from the dismiss button', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<SubmissionErrorCard open onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
