import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as ApiModule from '@/api';
import { renderWithProviders } from '@/test/utils';
import type { Question } from '@/types';

import { RoundEntry } from '../RoundEntry';

const { getQuestionsByRoundMock, getSessionMock, replaceMock } = vi.hoisted(() => ({
  getQuestionsByRoundMock: vi.fn(),
  getSessionMock: vi.fn(),
  replaceMock: vi.fn(),
}));

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/api');
  return { ...actual, getQuestionsByRound: getQuestionsByRoundMock, getSession: getSessionMock };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock, prefetch: vi.fn() }),
}));

function makeQuestion(overrides: Pick<Question, 'id' | 'title' | 'points'>): Question {
  return {
    description: '',
    type: 'code',
    inputFormat: [],
    buyIn: '20',
    reward: '50',
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
  getQuestionsByRoundMock.mockReset();
  getSessionMock.mockReset();
  replaceMock.mockReset();
});

describe('RoundEntry', () => {
  it('replaces the route with the first question in tab order', async () => {
    getSessionMock.mockResolvedValue({ userId: 'u1', balance: 0, score: 0, roundQualified: 2 });
    getQuestionsByRoundMock.mockResolvedValue([
      makeQuestion({ id: 'q-hard', title: 'Hard', points: 50 }),
      makeQuestion({ id: 'q-easy', title: 'Easy', points: 10 }),
    ]);

    renderWithProviders(<RoundEntry roundId={2} />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/round/2/q-easy'));
    expect(replaceMock).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state and does not redirect when the round has no questions', async () => {
    getSessionMock.mockResolvedValue({ userId: 'u1', balance: 0, score: 0, roundQualified: 2 });
    getQuestionsByRoundMock.mockResolvedValue([]);

    renderWithProviders(<RoundEntry roundId={2} />);

    expect(await screen.findByText('No problems in this round yet.')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('offers a retry when the questions fail to load', async () => {
    getSessionMock.mockResolvedValue({ userId: 'u1', balance: 0, score: 0, roundQualified: 2 });
    getQuestionsByRoundMock.mockRejectedValue(new Error('boom'));

    const user = userEvent.setup();
    renderWithProviders(<RoundEntry roundId={2} />);

    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(getQuestionsByRoundMock.mock.calls.length).toBeGreaterThan(1));
  });
});
