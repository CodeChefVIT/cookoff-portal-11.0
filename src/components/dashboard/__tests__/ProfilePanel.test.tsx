import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as sessionApi from '@/api/session';

import { ProfilePanel } from '../ProfilePanel';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function renderWithClient(ui: React.ReactElement, client = new QueryClient()) {
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('ProfilePanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    replaceMock.mockReset();
  });

  it('renders participant details correctly', () => {
    renderWithClient(
      <ProfilePanel
        name="Alan Turing"
        email="alan@vitstudent.ac.in"
        score={100}
        roundQualified={2}
        earnedPoints={30}
        totalPoints={60}
      />
    );

    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    expect(screen.getByText('alan@vitstudent.ac.in')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('triggers logout, clears query cache, and redirects to /login', async () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');
    const logoutSpy = vi.spyOn(sessionApi, 'logout').mockResolvedValueOnce();

    renderWithClient(
      <ProfilePanel
        name="Ada Lovelace"
        email="ada@vitstudent.ac.in"
        score={120}
        roundQualified={1}
        earnedPoints={40}
        totalPoints={40}
      />,
      queryClient
    );

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith('/login');
    });
  });
});
