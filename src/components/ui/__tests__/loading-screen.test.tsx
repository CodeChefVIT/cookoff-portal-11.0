import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingScreen } from '../loading-screen';

describe('LoadingScreen', () => {
  it('renders a status role for assistive tech', () => {
    render(<LoadingScreen />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('defaults to a generic loading message', () => {
    render(<LoadingScreen />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders a custom message when provided', () => {
    render(<LoadingScreen message="Checking round schedule…" />);

    expect(screen.getByText('Checking round schedule…')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });
});
