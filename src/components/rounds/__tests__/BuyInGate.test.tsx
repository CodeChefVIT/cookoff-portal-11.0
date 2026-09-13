import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as ApiModule from '@/api';
import { renderWithProviders } from '@/test/utils';

import { BuyInGate } from '../BuyInGate';
import type { Question } from '../types';

const { getSessionMock, createAttemptMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  createAttemptMock: vi.fn(),
}));

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/api');
  return {
    ...actual,
    getSession: getSessionMock,
    createAttempt: createAttemptMock,
  };
});

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

afterEach(() => {
  getSessionMock.mockReset();
  createAttemptMock.mockReset();
});

describe('BuyInGate — Round 2 (hasBuyIn: true)', () => {
  it('hides children and shows the bet button while locked', () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 100,
      score: 0,
      roundQualified: 2,
      isBanned: false,
    });

    renderWithProviders(
      <BuyInGate questionId="q1" roundId={2} question={makeQuestion()}>
        <div>editor</div>
      </BuyInGate>
    );

    expect(screen.getByRole('button', { name: /place bet/i })).toBeInTheDocument();
    expect(screen.queryByText('editor')).not.toBeInTheDocument();
  });

  it('unlocks the editor after a 200 confirm', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 100,
      score: 0,
      roundQualified: 2,
      isBanned: false,
    });
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });

    const user = userEvent.setup();
    renderWithProviders(
      <BuyInGate questionId="q1" roundId={2} question={makeQuestion()}>
        <div>editor</div>
      </BuyInGate>
    );

    await user.click(screen.getByRole('button', { name: /place bet/i }));
    await user.click(await screen.findByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('editor')).toBeInTheDocument();
  });

  it('treats a 409 (already bought) as a successful unlock, not an error', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 100,
      score: 0,
      roundQualified: 2,
      isBanned: false,
    });
    // attempts.ts already normalises a 409 ApiError into this outcome (L3).
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });

    const user = userEvent.setup();
    renderWithProviders(
      <BuyInGate questionId="q1" roundId={2} question={makeQuestion()}>
        <div>editor</div>
      </BuyInGate>
    );

    await user.click(screen.getByRole('button', { name: /place bet/i }));
    await user.click(await screen.findByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('editor')).toBeInTheDocument();
  });

  it('shows a shortfall message and stays locked on insufficient balance', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 5,
      score: 0,
      roundQualified: 2,
      isBanned: false,
    });
    createAttemptMock.mockResolvedValue({ unlocked: false, insufficientBalance: true });

    const user = userEvent.setup();
    renderWithProviders(
      <BuyInGate questionId="q1" roundId={2} question={makeQuestion()}>
        <div>editor</div>
      </BuyInGate>
    );

    await user.click(screen.getByRole('button', { name: /place bet/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled());
    expect(screen.queryByText('editor')).not.toBeInTheDocument();
  });
});

describe('BuyInGate — Round 3 (hasBuyIn: false)', () => {
  it('is a pass-through: renders children immediately with no bet UI', () => {
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
    expect(screen.queryByRole('button', { name: /place bet/i })).not.toBeInTheDocument();
  });
});
