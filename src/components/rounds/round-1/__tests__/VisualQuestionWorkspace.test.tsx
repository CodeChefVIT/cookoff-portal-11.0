import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as ApiModule from '@/api';
import { renderWithProviders, resetChainStore, resetRoundStore } from '@/test/utils';

import type { Question, VisualBlock } from '../../types';
import { ChainSubmitButton } from '../ChainSubmitButton';
import { VisualQuestionWorkspace } from '../VisualQuestionWorkspace';

const {
  getSessionMock,
  getRoundTimeMock,
  getQuestionsByRoundMock,
  getVisualBlocksMock,
  submitVisualMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  getRoundTimeMock: vi.fn(),
  getQuestionsByRoundMock: vi.fn(),
  getVisualBlocksMock: vi.fn(),
  submitVisualMock: vi.fn(),
}));

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/api');
  return {
    ...actual,
    getSession: getSessionMock,
    getRoundTime: getRoundTimeMock,
    getQuestionsByRound: getQuestionsByRoundMock,
    getVisualBlocks: getVisualBlocksMock,
    submitVisual: submitVisualMock,
  };
});

const QUESTION_R1: Question = {
  id: 'q1',
  title: 'Assemble: Hello World',
  description: 'Arrange the blocks into a chain that prints "Hello" followed by "World".',
  type: 'visual',
  inputFormat: [],
  buyIn: '0',
  reward: '0',
  points: 10,
  round: 1,
  constraints: [],
  outputFormat: [],
  sampleTestInput: [],
  sampleTestOutput: [],
  explanation: [],
};

const BLOCKS: VisualBlock[] = [
  { id: 'b1', content: 'Print "Hello"' },
  { id: 'b2', content: 'Print "World"' },
  { id: 'b3', content: 'Wait 1 second' },
];

function mockOpenRound() {
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
  getQuestionsByRoundMock.mockResolvedValue([QUESTION_R1]);
  getVisualBlocksMock.mockResolvedValue(BLOCKS);
}

function renderWorkspace(questionId: string) {
  return renderWithProviders(
    <NuqsTestingAdapter>
      <ChainSubmitButton questionId={questionId} />
      <VisualQuestionWorkspace questionId={questionId} />
    </NuqsTestingAdapter>
  );
}

afterEach(() => {
  vi.clearAllMocks();
  resetRoundStore();
  resetChainStore();
});

describe('VisualQuestionWorkspace — Round 1 happy path', () => {
  it('builds a chain by tapping palette blocks (use-once) and submits it', async () => {
    mockOpenRound();
    submitVisualMock.mockResolvedValue({
      pointsAwarded: 10,
      correct: true,
      alreadyAnswered: false,
    });

    const user = userEvent.setup();
    renderWorkspace('q1');

    await user.click(await screen.findByRole('button', { name: 'Print "Hello"' }));
    await user.click(await screen.findByRole('button', { name: 'Print "World"' }));

    // Placed blocks leave the palette — each block is used once.
    expect(screen.queryByRole('button', { name: 'Print "Hello"' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Print "World"' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wait 1 second' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(submitVisualMock).toHaveBeenCalledWith({ questionId: 'q1', blocks: ['b1', 'b2'] });
    expect(await screen.findByText(/Correct! \+10 points/)).toBeInTheDocument();
    expect(await screen.findByText('Solved!')).toBeInTheDocument();
  });

  it('reorders the chain with the move buttons', async () => {
    mockOpenRound();

    const user = userEvent.setup();
    renderWorkspace('q1');

    await user.click(await screen.findByRole('button', { name: 'Print "Hello"' }));
    await user.click(screen.getByRole('button', { name: 'Print "World"' }));
    await user.click(screen.getByRole('button', { name: 'Wait 1 second' }));

    // Chain is now: Hello, World, Wait. Move "Wait" up one slot.
    await user.click(screen.getByRole('button', { name: 'Move "Wait 1 second" up' }));

    const chain = screen.getByRole('region', { name: 'Your chain' });
    const text = chain.textContent ?? '';
    expect(text.indexOf('Print "Hello"')).toBeLessThan(text.indexOf('Wait 1 second'));
    expect(text.indexOf('Wait 1 second')).toBeLessThan(text.indexOf('Print "World"'));
  });

  it('shows a wrong-order verdict and keeps the chain intact', async () => {
    mockOpenRound();
    submitVisualMock.mockResolvedValue({
      pointsAwarded: 0,
      correct: false,
      alreadyAnswered: false,
    });

    const user = userEvent.setup();
    renderWorkspace('q1');

    // Wrong order: World before Hello.
    await user.click(await screen.findByRole('button', { name: 'Print "World"' }));
    await user.click(screen.getByRole('button', { name: 'Print "Hello"' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText(/Not quite — rearrange your chain/)).toBeInTheDocument();
    expect(screen.queryByText('Solved!')).not.toBeInTheDocument();

    const chain = screen.getByRole('region', { name: 'Your chain' });
    expect(within(chain).getByText('Print "Hello"')).toBeInTheDocument();
    expect(within(chain).getByText('Print "World"')).toBeInTheDocument();
  });

  it('disables Submit while the chain is empty', async () => {
    mockOpenRound();

    renderWorkspace('q1');

    await screen.findByRole('button', { name: 'Print "Hello"' });
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('keeps the chain after the workspace remounts', async () => {
    mockOpenRound();

    const user = userEvent.setup();
    const view = renderWorkspace('q1');

    await user.click(await screen.findByRole('button', { name: 'Print "Hello"' }));
    view.unmount();

    renderWorkspace('q1');

    const chain = await screen.findByRole('region', { name: 'Your chain' });
    expect(within(chain).getByText('Print "Hello"')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Print "Hello"' })).not.toBeInTheDocument();
  });
});
