import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as ApiModule from '@/api';
import { renderWithProviders } from '@/test/utils';

import { BuyInGate } from '../BuyInGate';
import { BuyInLockSurface } from '../BuyInLock';
import type { Question } from '../types';

const { getSessionMock, createAttemptMock, pushMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  createAttemptMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/api');
  return {
    ...actual,
    getSession: getSessionMock,
    createAttempt: createAttemptMock,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), prefetch: vi.fn() }),
}));

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    title: 'Two Sum',
    description: '',
    type: 'code',
    inputFormat: [],
    buyIn: '20',
    reward: '50',
    points: 10,
    round: 2,
    constraints: [],
    outputFormat: [],
    sampleTestInput: [],
    sampleTestOutput: [],
    explanation: [],
    ...overrides,
  };
}

function mockSession(balance: number) {
  getSessionMock.mockResolvedValue({
    userId: 'u1',
    email: 'a@b.com',
    balance,
    score: 0,
    roundQualified: 2,
    isBanned: false,
  });
}

afterEach(() => {
  getSessionMock.mockReset();
  createAttemptMock.mockReset();
  pushMock.mockReset();
});

describe('BuyInGate — Round 2 (hasBuyIn: true)', () => {
  it('keeps the lock surface inert behind the confirm-purchase box while locked', () => {
    mockSession(100);

    renderWithProviders(
      <BuyInGate questionId="q1" roundId={2} question={makeQuestion()}>
        <BuyInLockSurface>
          <div>editor</div>
        </BuyInLockSurface>
      </BuyInGate>
    );

    expect(screen.getByText('CONFIRM PURCHASE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
    expect(screen.getByText('editor').closest('[inert]')).not.toBeNull();
  });

  it('unlocks the editor after a 200 on Enter', async () => {
    mockSession(100);
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });

    const user = userEvent.setup();
    renderWithProviders(
      <BuyInGate questionId="q1" roundId={2} question={makeQuestion()}>
        <BuyInLockSurface>
          <div>editor</div>
        </BuyInLockSurface>
      </BuyInGate>
    );

    await waitFor(() => expect(getSessionMock).toHaveBeenCalled());
    await user.click(await screen.findByRole('button', { name: 'Enter' }));

    await waitFor(() => expect(screen.getByText('editor').closest('[inert]')).toBeNull());
    expect(screen.queryByText('CONFIRM PURCHASE')).not.toBeInTheDocument();
  });

  it('treats a 409 (already bought) as a successful unlock, not an error', async () => {
    mockSession(100);
    // attempts.ts already normalises a 409 ApiError into this outcome (L3).
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });

    const user = userEvent.setup();
    renderWithProviders(
      <BuyInGate questionId="q1" roundId={2} question={makeQuestion()}>
        <BuyInLockSurface>
          <div>editor</div>
        </BuyInLockSurface>
      </BuyInGate>
    );

    await waitFor(() => expect(getSessionMock).toHaveBeenCalled());
    await user.click(await screen.findByRole('button', { name: 'Enter' }));

    await waitFor(() => expect(screen.getByText('editor').closest('[inert]')).toBeNull());
  });

  it('stays locked when the server reports an insufficient balance', async () => {
    mockSession(100);
    createAttemptMock.mockResolvedValue({ unlocked: false, insufficientBalance: true });

    const user = userEvent.setup();
    renderWithProviders(
      <BuyInGate questionId="q1" roundId={2} question={makeQuestion()}>
        <BuyInLockSurface>
          <div>editor</div>
        </BuyInLockSurface>
      </BuyInGate>
    );

    await waitFor(() => expect(getSessionMock).toHaveBeenCalled());
    await user.click(await screen.findByRole('button', { name: 'Enter' }));

    await waitFor(() => expect(createAttemptMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText('editor').closest('[inert]')).not.toBeNull();
  });

  it('never calls the attempt endpoint when the balance is short', async () => {
    mockSession(5);

    const user = userEvent.setup();
    renderWithProviders(
      <BuyInGate questionId="q1" roundId={2} question={makeQuestion()}>
        <BuyInLockSurface>
          <div>editor</div>
        </BuyInLockSurface>
      </BuyInGate>
    );

    await waitFor(() => expect(getSessionMock).toHaveBeenCalled());
    await user.click(await screen.findByRole('button', { name: 'Enter' }));

    expect(createAttemptMock).not.toHaveBeenCalled();
    expect(screen.getByText('editor').closest('[inert]')).not.toBeNull();
  });

  it('✕ returns to the dashboard', async () => {
    mockSession(100);

    const user = userEvent.setup();
    renderWithProviders(
      <BuyInGate questionId="q1" roundId={2} question={makeQuestion()}>
        <BuyInLockSurface>
          <div>editor</div>
        </BuyInLockSurface>
      </BuyInGate>
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });
});

describe('BuyInGate — Round 1 (hasBuyIn: false, autoAttempt: true)', () => {
  const r1Question = makeQuestion({ round: 1, type: 'visual', buyIn: '0', reward: '0' });

  it('renders children immediately and creates the attempt exactly once', async () => {
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });

    renderWithProviders(
      <BuyInGate questionId="q1" roundId={1} question={r1Question}>
        <div>workspace</div>
      </BuyInGate>
    );

    expect(screen.getByText('workspace')).toBeInTheDocument();
    expect(screen.queryByText('CONFIRM PURCHASE')).not.toBeInTheDocument();
    await waitFor(() => expect(createAttemptMock).toHaveBeenCalledTimes(1));
    expect(createAttemptMock).toHaveBeenCalledWith('q1');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('skips the attempt when the question is already bought', () => {
    renderWithProviders(
      <BuyInGate questionId="q1" roundId={1} question={{ ...r1Question, bought: true }}>
        <div>workspace</div>
      </BuyInGate>
    );

    expect(screen.getByText('workspace')).toBeInTheDocument();
    expect(createAttemptMock).not.toHaveBeenCalled();
  });

  it('shows a retry banner when the unlock fails, and retries on click', async () => {
    createAttemptMock.mockRejectedValueOnce(new Error('boom'));
    createAttemptMock.mockResolvedValueOnce({ unlocked: true, insufficientBalance: false });

    const user = userEvent.setup();
    renderWithProviders(
      <BuyInGate questionId="q1" roundId={1} question={r1Question}>
        <div>workspace</div>
      </BuyInGate>
    );

    await user.click(await screen.findByRole('button', { name: 'Retry unlock' }));
    await waitFor(() => expect(createAttemptMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByText('workspace')).toBeInTheDocument();
  });
});

describe('BuyInGate — Round 3 (hasBuyIn: false)', () => {
  it('is a pass-through: renders children immediately with no bet prompt', () => {
    renderWithProviders(
      <BuyInGate
        questionId="q1"
        roundId={3}
        question={makeQuestion({ round: 3, buyIn: '0', reward: '0' })}
      >
        <div>editor</div>
      </BuyInGate>
    );

    expect(screen.getByText('editor')).toBeInTheDocument();
    expect(screen.queryByText('CONFIRM PURCHASE')).not.toBeInTheDocument();
  });
});
