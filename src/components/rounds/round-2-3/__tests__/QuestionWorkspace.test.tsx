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
  runCodeMock,
  routerPushMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  getRoundTimeMock: vi.fn(),
  getQuestionsByRoundMock: vi.fn(),
  getPublicTestcasesMock: vi.fn(),
  createAttemptMock: vi.fn(),
  submitCodeMock: vi.fn(),
  getSubmissionResultMock: vi.fn(),
  runCodeMock: vi.fn(),
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
    runCode: runCodeMock,
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

  it('does not re-open a closed verdict popup after leaving and returning', async () => {
    // Own question and submission ids: in-flight submissions and dismissed
    // verdicts are module state that outlives each test's render.
    const question = { ...QUESTION_R2, id: 'q-revisit' };
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
    getQuestionsByRoundMock.mockResolvedValue([question]);
    getPublicTestcasesMock.mockResolvedValue(TESTCASES);
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });
    submitCodeMock.mockResolvedValue({ submissionId: 'sub-revisit' });
    getSubmissionResultMock.mockResolvedValue({
      submissionId: 'sub-revisit',
      questionId: 'q-revisit',
      passed: 1,
      failed: 0,
      description: 'All 1 testcases passed',
      testcases: [{ testcaseId: 'tc1', status: 'Success', description: 'Success' }],
    });

    const user = userEvent.setup();
    const first = renderWorkspace(2, 'q-revisit');

    await user.click(await screen.findByRole('button', { name: 'Enter' }));
    await user.click(await screen.findByRole('button', { name: /submit code/i }));
    expect(await screen.findByText('CORRECT ANSWER')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByText('CORRECT ANSWER')).not.toBeInTheDocument());

    // A question-tab switch remounts the workspace.
    first.unmount();
    getQuestionsByRoundMock.mockResolvedValue([{ ...question, solved: true }]);
    renderWorkspace(2, 'q-revisit');

    expect(await screen.findByText(/1\/1 Test Cases Passed/)).toBeInTheDocument();
    expect(screen.queryByText('CORRECT ANSWER')).not.toBeInTheDocument();
    expect(screen.queryByText(/already solved/i)).not.toBeInTheDocument();
    expect(submitCodeMock).toHaveBeenCalledTimes(1);
  });

  it('shows a later run instead of an earlier failed submission', async () => {
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
      passed: 0,
      failed: 1,
      description: '0/1 testcases passed (Wrong Answer)',
      testcases: [{ testcaseId: 'tc1', status: 'Wrong Answer', description: 'Wrong Answer' }],
    });
    runCodeMock.mockResolvedValue({
      submissionId: 'run-1',
      questionId: 'q1',
      passed: 1,
      failed: 0,
      description: 'All sample testcases passed',
      testcases: [{ testcaseId: 'tc1', status: 'Success', description: '', stdout: 'out' }],
    });

    const user = userEvent.setup();
    renderWorkspace(2, 'q1');

    await user.click(await screen.findByRole('button', { name: 'Enter' }));
    await user.click(await screen.findByRole('button', { name: /submit code/i }));
    expect(await screen.findByText(/0\/1 Test Cases Passed/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /run code/i }));

    expect(await screen.findByText(/1\/1 Test Cases Passed/)).toBeInTheDocument();
    expect(screen.queryByText(/0\/1 Test Cases Passed/)).not.toBeInTheDocument();
    expect(runCodeMock).toHaveBeenCalledTimes(1);
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
    submitCodeMock.mockRejectedValue(
      new ApiError({ message: 'not purchased', status: 403, code: 'NOT_PURCHASED' })
    );

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

describe('QuestionWorkspace — rate limited', () => {
  it('disables Submit for the Retry-After window instead of showing a failure', async () => {
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
    submitCodeMock.mockRejectedValue(
      new ApiError({
        message: 'Too many requests, slow down',
        status: 429,
        code: 'RATE_LIMITED',
        retryAfter: 5,
      })
    );

    const user = userEvent.setup();
    renderWorkspace(3, 'q2');

    const submit = await screen.findByRole('button', { name: /submit code/i });
    await user.click(submit);

    await waitFor(() => expect(submit).toBeDisabled());
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

  it('does not call /attempts on open: the backend opens R3 attempts itself', async () => {
    mockRoundThree();

    renderWorkspace(3, 'q2');

    expect(await screen.findByRole('button', { name: /submit code/i })).toBeInTheDocument();
    expect(createAttemptMock).not.toHaveBeenCalled();
    expect(screen.queryByText('CONFIRM PURCHASE')).not.toBeInTheDocument();
  });

  it('shows the failure card when /submit reports the question is not unlocked', async () => {
    mockRoundThree();
    createAttemptMock.mockResolvedValue({ unlocked: true, insufficientBalance: false });
    submitCodeMock.mockRejectedValue(
      new ApiError({
        message: 'Question not purchased — buy this question before submitting',
        status: 403,
        code: 'NOT_PURCHASED',
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
      new ApiError({
        message: 'User not qualified for this round',
        status: 403,
        code: 'NOT_QUALIFIED',
      })
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
