import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as ApiModule from '@/api';
import { renderWithProviders } from '@/test/utils';

import { RoundGate } from '../RoundGate';

const { getSessionMock, getRoundTimeMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  getRoundTimeMock: vi.fn(),
}));

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/api');
  return {
    ...actual,
    getSession: getSessionMock,
    getRoundTime: getRoundTimeMock,
  };
});

afterEach(() => {
  getSessionMock.mockReset();
  getRoundTimeMock.mockReset();
});

describe('RoundGate', () => {
  it('shows the not-qualified screen when round_qualified is below the gated round', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 0,
      score: 0,
      roundQualified: 1,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 1000),
      roundEndTime: new Date(Date.now() + 60_000),
    });

    renderWithProviders(
      <RoundGate roundId={2}>
        <div>gameplay</div>
      </RoundGate>
    );

    expect(
      await screen.findByRole('heading', { name: /didn.t make the cut/i })
    ).toBeInTheDocument();
    expect(screen.queryByText('gameplay')).not.toBeInTheDocument();
  });

  it('closes an old round once the contestant has qualified past it', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 0,
      score: 0,
      roundQualified: 2,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 1000),
      roundEndTime: new Date(Date.now() + 60_000),
    });

    renderWithProviders(
      <RoundGate roundId={1}>
        <div>gameplay</div>
      </RoundGate>
    );

    expect(await screen.findByRole('heading', { name: /has ended/i })).toBeInTheDocument();
    expect(screen.queryByText('gameplay')).not.toBeInTheDocument();
  });

  it('shows the pending intermission while the admin has not started the round', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 0,
      score: 0,
      roundQualified: 1,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: null,
      roundEndTime: null,
      round: 1,
    });

    renderWithProviders(
      <RoundGate roundId={1}>
        <div>gameplay</div>
      </RoundGate>
    );

    expect(await screen.findByText('Scratch')).toBeInTheDocument();
    expect(screen.queryByText('gameplay')).not.toBeInTheDocument();
  });

  it('renders the pending intermission before the round window opens', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 0,
      score: 0,
      roundQualified: 2,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() + 60_000),
      roundEndTime: new Date(Date.now() + 120_000),
    });

    renderWithProviders(
      <RoundGate roundId={2}>
        <div>gameplay</div>
      </RoundGate>
    );

    expect(await screen.findByText("Chef's Pantry")).toBeInTheDocument();
    expect(screen.queryByText('gameplay')).not.toBeInTheDocument();
  });

  it('renders children when qualified and the round window is open', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 0,
      score: 0,
      roundQualified: 2,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 60_000),
      roundEndTime: new Date(Date.now() + 60_000),
    });

    renderWithProviders(
      <RoundGate roundId={2}>
        <div>gameplay</div>
      </RoundGate>
    );

    await waitFor(() => expect(screen.getByText('gameplay')).toBeInTheDocument());
  });

  it('does not block gameplay when /getTime fails (timer degrades instead)', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 0,
      score: 0,
      roundQualified: 3,
      isBanned: false,
    });
    getRoundTimeMock.mockRejectedValue(new Error('network down'));

    renderWithProviders(
      <RoundGate roundId={3}>
        <div>gameplay</div>
      </RoundGate>
    );

    await waitFor(() => expect(screen.getByText('gameplay')).toBeInTheDocument(), {
      timeout: 3000,
    });
  });
});

describe('RoundGate — Round 1', () => {
  it('shows the not-qualified screen before Round 1 is unlocked', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 0,
      score: 0,
      roundQualified: 0,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 1000),
      roundEndTime: new Date(Date.now() + 60_000),
    });

    renderWithProviders(
      <RoundGate roundId={1}>
        <div>gameplay</div>
      </RoundGate>
    );

    expect(
      await screen.findByRole('heading', { name: /didn.t make the cut/i })
    ).toBeInTheDocument();
    expect(screen.queryByText('gameplay')).not.toBeInTheDocument();
  });

  it('renders the pending intermission before Round 1 opens', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 0,
      score: 0,
      roundQualified: 1,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() + 60_000),
      roundEndTime: new Date(Date.now() + 120_000),
    });

    renderWithProviders(
      <RoundGate roundId={1}>
        <div>gameplay</div>
      </RoundGate>
    );

    expect(await screen.findByRole('heading', { name: 'Scratch' })).toBeInTheDocument();
    expect(screen.queryByText('gameplay')).not.toBeInTheDocument();
  });

  it('renders children when qualified and the Round 1 window is open', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 0,
      score: 0,
      roundQualified: 1,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 60_000),
      roundEndTime: new Date(Date.now() + 60_000),
    });

    renderWithProviders(
      <RoundGate roundId={1}>
        <div>gameplay</div>
      </RoundGate>
    );

    await waitFor(() => expect(screen.getByText('gameplay')).toBeInTheDocument());
  });

  it('shows the ended screen once the window closes — R1 is not the final round', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 0,
      score: 0,
      roundQualified: 1,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 120_000),
      roundEndTime: new Date(Date.now() - 60_000),
    });

    renderWithProviders(
      <RoundGate roundId={1}>
        <div>gameplay</div>
      </RoundGate>
    );

    expect(await screen.findByRole('heading', { name: 'Scratch has ended' })).toBeInTheDocument();
    expect(screen.queryByText('gameplay')).not.toBeInTheDocument();
  });
});
