import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api';
import type * as ApiModule from '@/api';
import { renderWithProviders, resetRoundStore } from '@/test/utils';

import type { Question, Testcase } from '../../types';
import { getLanguageById } from '../languages';
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

// Question tabs and BuyInConfirm navigate via the App Router.
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

    expect(await screen.findByText(/1\/1 Test Cases Passed/)).toBeInTheDocument();
    expect(submitCodeMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('CORRECT ANSWER')).toBeInTheDocument();
    expect(screen.getByText('You earned 10 points and 50 coins.')).toBeInTheDocument();
  });

  it('switches the language and swaps the pristine boilerplate', async () => {
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

    const user = userEvent.setup();
    renderWorkspace(2, 'q1');
    await user.click(await screen.findByRole('button', { name: 'Enter' }));

    const selector = await screen.findByLabelText('Language');
    expect(selector).toHaveValue('54');
    expect(screen.getByLabelText('Code editor')).toHaveValue(getLanguageById(54).boilerplate);

    await user.selectOptions(selector, '62');

    expect(selector).toHaveValue('62');
    expect(screen.getByLabelText('Code editor')).toHaveValue(getLanguageById(62).boilerplate);
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

    expect(await screen.findByText('CONFIRM PURCHASE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
    expect(screen.queryByText('Submission Failed')).not.toBeInTheDocument();
  });
});

describe('QuestionWorkspace — submit failure', () => {
  it('shows the Submission Failed card when /submit errors, and dismisses it', async () => {
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
    submitCodeMock.mockRejectedValue(new ApiError({ message: 'boom', status: 500 }));

    const user = userEvent.setup();
    renderWorkspace(3, 'q2');

    await user.click(await screen.findByRole('button', { name: /submit code/i }));

    expect(await screen.findByText('Submission Failed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Submission Failed')).not.toBeInTheDocument();
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

    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });

    renderWorkspace(3, 'q2');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /submit code/i })).toBeInTheDocument()
    );
    expect(screen.queryByText('CONFIRM PURCHASE')).not.toBeInTheDocument();
  });

  it('unlocks the free attempt on open, because /submit requires one in every round', async () => {
    mockRoundThree();
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });

    renderWorkspace(3, 'q2');

    await waitFor(() => expect(createAttemptMock).toHaveBeenCalledTimes(1));
    expect(createAttemptMock).toHaveBeenCalledWith('q2');
    expect(screen.queryByText('CONFIRM PURCHASE')).not.toBeInTheDocument();
  });

  it('shows the failure card when /submit reports the question is not unlocked', async () => {
    mockRoundThree();
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });
    submitCodeMock.mockRejectedValue(
      new ApiError({
        message: 'Question not purchased — buy this question before submitting',
        status: 403,
      })
    );

    const user = userEvent.setup();
    renderWorkspace(3, 'q2');

    await user.click(await screen.findByRole('button', { name: /submit code/i }));

    // Round 3 has no buy-in gate to fall back on, so swallowing this left the player with nothing.
    expect(await screen.findByText('Submission Failed')).toBeInTheDocument();
    expect(screen.getByText(/is not unlocked yet\. Reopen it and try again/i)).toBeInTheDocument();
  });

  it('names the reason when the round is no longer open for the account', async () => {
    mockRoundThree();
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });
    submitCodeMock.mockRejectedValue(
      new ApiError({ message: 'User not qualified for this round', status: 403 })
    );

    const user = userEvent.setup();
    renderWorkspace(3, 'q2');

    await user.click(await screen.findByRole('button', { name: /submit code/i }));

    expect(
      await screen.findByText(/round is no longer open for your account/i)
    ).toBeInTheDocument();
  });
});

function mockRoundThree() {
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
}
