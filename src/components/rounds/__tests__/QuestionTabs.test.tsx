import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/utils';
import type { Question } from '@/types';

import { QuestionTabs } from '../QuestionTabs';
import { ScratchQuestionTabs } from '../round-1/ScratchQuestionTabs';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

function makeQuestion(overrides: Partial<Question> & Pick<Question, 'id'>): Question {
  return {
    title: 'Two Sum',
    description: 'Add two numbers.',
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

const QUESTIONS = [
  makeQuestion({ id: 'q1', solved: true }),
  makeQuestion({ id: 'q2', solved: false }),
];

describe('QuestionTabs', () => {
  it('marks a solved question and leaves the rest alone', () => {
    renderWithProviders(<QuestionTabs roundId={2} questions={QUESTIONS} activeId="q2" />);

    const [solved, unsolved] = screen.getAllByRole('tab');
    expect(solved).toHaveAttribute('data-solved', 'true');
    expect(solved).toHaveAccessibleName('Problem 1, solved');
    expect(unsolved).not.toHaveAttribute('data-solved');
  });
});

describe('ScratchQuestionTabs', () => {
  it('marks a solved question and leaves the rest alone', () => {
    renderWithProviders(<ScratchQuestionTabs roundId={1} questions={QUESTIONS} activeId="q2" />);

    const [solved, unsolved] = screen.getAllByRole('tab');
    expect(solved).toHaveAttribute('data-solved', 'true');
    expect(solved.className).toContain('bg-code-passed-text');
    expect(unsolved).not.toHaveAttribute('data-solved');
    expect(unsolved.className).toContain('bg-scratch-tab');
  });
});
