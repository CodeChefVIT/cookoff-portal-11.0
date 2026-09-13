import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as ApiModule from '@/api';
import { renderWithProviders } from '@/test/utils';

import { QuestionList } from '../QuestionList';
import type { Question } from '../types';

const { getQuestionsByRoundMock } = vi.hoisted(() => ({
  getQuestionsByRoundMock: vi.fn(),
}));

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/api');
  return { ...actual, getQuestionsByRound: getQuestionsByRoundMock };
});

function makeQuestion(
  overrides: Partial<Question> & Pick<Question, 'id' | 'title' | 'points'>
): Question {
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
});

describe('QuestionList', () => {
  it('sorts questions by points ascending', async () => {
    getQuestionsByRoundMock.mockResolvedValue([
      makeQuestion({ id: 'q2', title: 'Hard One', points: 50 }),
      makeQuestion({ id: 'q1', title: 'Easy One', points: 10 }),
    ]);

    renderWithProviders(<QuestionList roundId={2} />);

    const headings = await screen.findAllByRole('heading', { level: 3 });
    expect(headings.map(heading => heading.textContent)).toEqual(['Easy One', 'Hard One']);
  });

  it('shows a Solved badge for a solved question', async () => {
    getQuestionsByRoundMock.mockResolvedValue([
      makeQuestion({ id: 'q1', title: 'Solved Q', points: 10, solved: true }),
    ]);

    renderWithProviders(<QuestionList roundId={2} />);

    expect(await screen.findByText('Solved')).toBeInTheDocument();
  });

  it('never renders a badge when solved/bought flags are absent (L4)', async () => {
    getQuestionsByRoundMock.mockResolvedValue([
      makeQuestion({ id: 'q1', title: 'Unknown State', points: 10 }),
    ]);

    renderWithProviders(<QuestionList roundId={2} />);

    await screen.findByText('Unknown State');
    expect(screen.queryByText('Solved')).not.toBeInTheDocument();
    expect(screen.queryByText('Locked')).not.toBeInTheDocument();
    expect(screen.queryByText('Bet placed')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no questions', async () => {
    getQuestionsByRoundMock.mockResolvedValue([]);

    renderWithProviders(<QuestionList roundId={2} />);

    expect(await screen.findByText(/no problems available yet/i)).toBeInTheDocument();
  });

  it('shows a retry affordance on error', async () => {
    getQuestionsByRoundMock.mockRejectedValue(new Error('network error'));

    renderWithProviders(<QuestionList roundId={2} />);

    await waitFor(() => expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument());
  });
});
