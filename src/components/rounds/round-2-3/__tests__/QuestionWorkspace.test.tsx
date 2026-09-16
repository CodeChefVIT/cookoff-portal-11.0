import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api';
import type * as ApiModule from '@/api';
import { renderWithProviders, resetRoundStore } from '@/test/utils';

import type { Question, Testcase } from '../../types';
import { QuestionWorkspace } from '../QuestionWorkspace';

const {
  getSessionMock,
  getRoundTimeMock,
  getQuestionsByRoundMock,
  getPublicTestcasesMock,
  createAttemptMock,
  submitCodeMock,
  getSubmissionResultMock,
  routerPushMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  getRoundTimeMock: vi.fn(),
  getQuestionsByRoundMock: vi.fn(),
  getPublicTestcasesMock: vi.fn(),
  createAttemptMock: vi.fn(),
  submitCodeMock: vi.fn(),
  getSubmissionResultMock: vi.fn(),
  routerPushMock: vi.fn(),
}));

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/api');
  return {
    ...actual,
    getSession: getSessionMock,
    getRoundTime: getRoundTimeMock,
    getQuestionsByRound: getQuestionsByRoundMock,
    getPublicTestcases: getPublicTestcasesMock,
    createAttempt: createAttemptMock,
    submitCode: submitCodeMock,
    getSubmissionResult: getSubmissionResultMock,
  };
});

// Question tabs, BuyInConfirm and the bounty dialog all navigate via the App Router.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPushMock, replace: vi.fn(), prefetch: vi.fn() }),
}));

const QUESTION_R2: Question = {
  id: 'q1',
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
};

const QUESTION_R3: Question = { ...QUESTION_R2, id: 'q2', round: 3, buyIn: '0', reward: '0' };

const TESTCASES: Testcase[] = [
  {
    id: 'tc1',
    questionId: 'q1',
    input: 'in',
    expectedOutput: 'out',
    memory: 1,
    runtime: 1,
    hidden: false,
  },
];

function renderWorkspace(roundId: 2 | 3, questionId: string) {
  return renderWithProviders(
    <NuqsTestingAdapter>
      <QuestionWorkspace roundId={roundId} questionId={questionId} />
    </NuqsTestingAdapter>
  );
}

afterEach(() => {
  vi.clearAllMocks();
  resetRoundStore();
});

describe('QuestionWorkspace — Round 2 happy path', () => {
  it('unlocks after a bet, then submits and shows the pass verdict', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 100,
      score: 0,
      roundQualified: 2,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 1000),
      roundEndTime: new Date(Date.now() + 60_000),
    });
    getQuestionsByRoundMock.mockResolvedValue([QUESTION_R2]);
    getPublicTestcasesMock.mockResolvedValue(TESTCASES);
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });
    submitCodeMock.mockResolvedValue({ submissionId: 'sub1' });
    getSubmissionResultMock.mockResolvedValue({
      submissionId: 'sub1',
      questionId: 'q1',
      passed: 1,
      failed: 0,
      description: 'All 1 testcases passed',
      testcases: [{ testcaseId: 'tc1', status: 'Success', description: 'Success' }],
    });

    const user = userEvent.setup();
    renderWorkspace(2, 'q1');

    await user.click(await screen.findByRole('button', { name: 'Enter' }));

    await user.click(await screen.findByRole('button', { name: /submit code/i }));
    const confirmDialog = await screen.findByRole('alertdialog', {
      name: /confirm final submission/i,
    });
    await user.click(within(confirmDialog).getByRole('button', { name: /submit code/i }));

    expect(await screen.findByText(/1\/1 Test Cases Passed/)).toBeInTheDocument();
    expect(submitCodeMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('CORRECT ANSWER')).toBeInTheDocument();
    expect(screen.getByText('You earned 10 points and 50 coins.')).toBeInTheDocument();
  });

  it('re-locks the question when /submit reports it was never purchased (stale cache)', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 100,
      score: 0,
      roundQualified: 2,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 1000),
      roundEndTime: new Date(Date.now() + 60_000),
    });
    getQuestionsByRoundMock.mockResolvedValue([{ ...QUESTION_R2, bought: true }]);
    getPublicTestcasesMock.mockResolvedValue(TESTCASES);
    submitCodeMock.mockRejectedValue(new ApiError({ message: 'not purchased', status: 402 }));

    const user = userEvent.setup();
    renderWorkspace(2, 'q1');

    await user.click(await screen.findByRole('button', { name: /submit code/i }));
    const confirmDialog = await screen.findByRole('alertdialog', {
      name: /confirm final submission/i,
    });
    await user.click(within(confirmDialog).getByRole('button', { name: /submit code/i }));

    expect(await screen.findByText('CONFIRM PURCHASE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
  });
});

describe('QuestionWorkspace — Round 3 (no betting)', () => {
  it('is unlocked immediately with no bet UI and no currency box', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 100,
      score: 0,
      roundQualified: 3,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 1000),
      roundEndTime: new Date(Date.now() + 60_000),
    });
    getQuestionsByRoundMock.mockResolvedValue([QUESTION_R3]);
    getPublicTestcasesMock.mockResolvedValue(TESTCASES);

    renderWorkspace(3, 'q2');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /submit code/i })).toBeInTheDocument()
    );
    expect(screen.queryByText('CONFIRM PURCHASE')).not.toBeInTheDocument();
  });
});

describe('QuestionWorkspace — bounty-active question', () => {
  const BOUNTY_QUESTION: Question = { ...QUESTION_R3, bountyActive: true };

  function mockCommon() {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 100,
      score: 0,
      roundQualified: 3,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 1000),
      roundEndTime: new Date(Date.now() + 60_000),
    });
    getQuestionsByRoundMock.mockResolvedValue([BOUNTY_QUESTION]);
    getPublicTestcasesMock.mockResolvedValue(TESTCASES);
  }

  it('shows the unlock dialog and clears the draft on Enter Bounty', async () => {
    mockCommon();
    const user = userEvent.setup();
    renderWorkspace(3, 'q2');

    expect(await screen.findByText('Unlock this question?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Enter Bounty' }));

    await waitFor(() =>
      expect(screen.queryByText('Unlock this question?')).not.toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: /submit code/i })).toBeInTheDocument();
  });

  it('shows the bounty prompt before the buy-in box on a locked Round 2 question', async () => {
    getSessionMock.mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      balance: 100,
      score: 0,
      roundQualified: 2,
      isBanned: false,
    });
    getRoundTimeMock.mockResolvedValue({
      serverTime: new Date(),
      roundStartTime: new Date(Date.now() - 1000),
      roundEndTime: new Date(Date.now() + 60_000),
    });
    getQuestionsByRoundMock.mockResolvedValue([{ ...QUESTION_R2, bountyActive: true }]);
    getPublicTestcasesMock.mockResolvedValue(TESTCASES);
    const user = userEvent.setup();
    renderWorkspace(2, 'q1');

    expect(await screen.findByText('Unlock this question?')).toBeInTheDocument();
    expect(screen.queryByText('CONFIRM PURCHASE')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Enter Bounty' }));

    expect(await screen.findByText('CONFIRM PURCHASE')).toBeInTheDocument();
  });

  it('navigates back to the round menu on Stay Here', async () => {
    mockCommon();
    const user = userEvent.setup();
    renderWorkspace(3, 'q2');

    await screen.findByText('Unlock this question?');
    await user.click(screen.getByRole('button', { name: 'Stay Here' }));

    expect(routerPushMock).toHaveBeenCalledWith('/round/3');
  });

  it('never shows the unlock dialog again after it has been resolved', async () => {
    mockCommon();
    const user = userEvent.setup();
    renderWorkspace(3, 'q2');

    await user.click(await screen.findByRole('button', { name: 'Enter Bounty' }));
    await waitFor(() =>
      expect(screen.queryByText('Unlock this question?')).not.toBeInTheDocument()
    );

    renderWorkspace(3, 'q2');
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /submit code/i }).length).toBeGreaterThan(0)
    );
    expect(screen.queryByText('Unlock this question?')).not.toBeInTheDocument();
  });
});
